import { NextResponse } from "next/server";
import { createCallbackSupabaseClient } from "@/lib/supabase/callback-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createCallbackSupabaseClient();

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !sessionData.user) {
      return NextResponse.redirect(
        `${origin}/login?error=code_exchange_failed`,
      );
    }

    const user = sessionData.user;

    const { data: existingUser, error: fetchUserError } = await supabase
      .from("users")
      .select("id, tenant_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchUserError) {
      return NextResponse.redirect(
        `${origin}/login?error=fetch_user_failed`,
      );
    }

    let tenantId: string | null = existingUser?.tenant_id ?? null;
    const role = existingUser?.role ?? "ADMIN";

    if (!existingUser) {
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1);

      if (tenantsError) {
        return NextResponse.redirect(
          `${origin}/login?error=fetch_tenant_failed`,
        );
      }

      if (!tenants || tenants.length === 0) {
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
          return NextResponse.redirect(
            `${origin}/login?error=create_tenant_failed`,
          );
        }

        tenantId = newTenant?.id ?? null;
      } else {
        tenantId = tenants[0].id;
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
        return NextResponse.redirect(
          `${origin}/login?error=create_user_failed`,
        );
      }
    } else {
      const { error: updateUserError } = await supabase
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateUserError) {
      }
    }

    if (tenantId) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          role,
          tenant_id: tenantId,
        },
      });

      if (metadataError) {
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
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    return NextResponse.redirect(`${origin}/login?error=callback_exception`);
  }
}
