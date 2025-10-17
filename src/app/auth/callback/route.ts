import { NextResponse } from "next/server";
import { createCallbackSupabaseClient } from "@/lib/supabase/callback-client";

const LOG_PREFIX = "[auth/callback]";

function logInfo(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.log(`${LOG_PREFIX} ${message}`, meta);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

function logWarn(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.warn(`${LOG_PREFIX} ${message}`, meta);
  } else {
    console.warn(`${LOG_PREFIX} ${message}`);
  }
}

function logError(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.error(`${LOG_PREFIX} ${message}`, meta);
  } else {
    console.error(`${LOG_PREFIX} ${message}`);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  logInfo("Inbound callback received", { hasCode: !!code, origin });

  if (!code) {
    logWarn("Missing `code` query param, redirecting to login");
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createCallbackSupabaseClient();
    logInfo("Exchanging code for session");

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !sessionData.user) {
      logError("Failed to exchange code for session", {
        exchangeError: exchangeError?.message,
      });
      return NextResponse.redirect(
        `${origin}/login?error=code_exchange_failed`,
      );
    }

    const user = sessionData.user;
    logInfo("Session exchange succeeded", {
      userId: user.id,
      email: user.email,
    });

    const { data: existingUser, error: fetchUserError } = await supabase
      .from("users")
      .select("id, tenant_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchUserError) {
      logError("Failed to fetch existing user", {
        userId: user.id,
        fetchUserError: fetchUserError.message,
      });
      return NextResponse.redirect(
        `${origin}/login?error=fetch_user_failed`,
      );
    }

    let tenantId: string | null = existingUser?.tenant_id ?? null;
    const role = existingUser?.role ?? "ADMIN";

    if (!existingUser) {
      logInfo("No existing user found, provisioning new account", {
        userId: user.id,
        email: user.email,
      });

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1);

      if (tenantsError) {
        logError("Failed to fetch tenants for auto-assignment", {
          tenantsError: tenantsError.message,
        });
        return NextResponse.redirect(
          `${origin}/login?error=fetch_tenant_failed`,
        );
      }

      if (!tenants || tenants.length === 0) {
        logWarn(
          "No tenant found, creating default tenant for first user provision",
        );
        const { data: newTenant, error: newTenantError } = await supabase
          .from("tenants")
          .insert({
            company_name: "Default Company",
            subdomain: "default",
            business_domain: "GENERAL_SERVICES",
            active: true,
          })
          .select("id")
          .single();

        if (newTenantError) {
          logError("Failed to create default tenant", {
            newTenantError: newTenantError.message,
          });
          return NextResponse.redirect(
            `${origin}/login?error=create_tenant_failed`,
          );
        }

        tenantId = newTenant?.id ?? null;
        logInfo("Default tenant created", { tenantId });
      } else {
        tenantId = tenants[0].id;
        logInfo("Tenant resolved from existing records", { tenantId });
      }

      const { error: insertUserError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null,
        picture_url:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null,
        role: "ADMIN",
        tenant_id: tenantId,
        active: true,
        last_login_at: new Date().toISOString(),
      });

      if (insertUserError) {
        logError("Failed to insert new user", {
          userId: user.id,
          insertUserError: insertUserError.message,
        });
        return NextResponse.redirect(
          `${origin}/login?error=create_user_failed`,
        );
      }

      logInfo("New user provisioned successfully", {
        userId: user.id,
        tenantId,
      });
    } else {
      logInfo("Existing user found, updating activity timestamps", {
        userId: user.id,
        tenantId,
        role,
      });

      const { error: updateUserError } = await supabase
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateUserError) {
        logError("Failed to update existing user timestamps", {
          userId: user.id,
          updateUserError: updateUserError.message,
        });
      }
    }

    if (tenantId) {
      logInfo("Decorating auth metadata with tenant/role", { tenantId, role });
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          role,
          tenant_id: tenantId,
        },
      });

      if (metadataError) {
        logError("Failed to update auth metadata", {
          metadataError: metadataError.message,
        });
      }

      const { error: activityLogError } = await supabase
        .from("activity_logs")
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          action_type: "LOGIN",
          success: true,
        });

      if (activityLogError) {
        logError("Failed to record login activity log", {
          activityLogError: activityLogError.message,
        });
      }
    } else {
      logWarn(
        "Tenant ID still null after processing user, metadata/activity log skipped",
        { userId: user.id },
      );
    }

    logInfo("Authentication callback finished successfully", {
      userId: user.id,
      redirect: "/dashboard",
    });
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    logError("Unexpected error handling auth callback", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(`${origin}/login?error=callback_exception`);
  }
}
