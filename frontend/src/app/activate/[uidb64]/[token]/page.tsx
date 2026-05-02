import type { Metadata } from "next";
import { ActivateClient } from "./ActivateClient";

export const metadata: Metadata = {
  title: "Activate account · ShopHub",
  description: "Confirm your email and activate your account.",
};

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ uidb64: string; token: string }>;
}) {
  const { uidb64, token } = await params;

  return (
    <div className="mx-auto max-w-md pb-8">
      <p className="mb-6 text-center text-sm text-zinc-600">
        Email confirmation · you stay on ShopHub; your browser only talks to our API in the background.
      </p>
      <h1 className="sr-only">Activate account</h1>
      <ActivateClient uidb64={uidb64} token={token} />
    </div>
  );
}
