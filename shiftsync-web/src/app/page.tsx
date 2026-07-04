import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  const accessToken = cookies().get("accessToken")?.value;

  return <LandingPage isAuthenticated={Boolean(accessToken)} />;
}
