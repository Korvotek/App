import { NextResponse } from "next/server";
import { handleContaAzulCallback } from "@/actions/contaazul-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul?error=${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul?error=missing_params`
    );
  }

  try {
    const result = await handleContaAzulCallback(code);
    
    if (result.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul?success=true`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul?error=${encodeURIComponent(result.message)}`
      );
    }
  } catch (error) {
    console.error("Error in ContaAzul callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul?error=callback_error`
    );
  }
}
