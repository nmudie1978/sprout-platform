import { redirect } from "next/navigation";

// Redirect old /growth route to the unified /my-journey page
export default function GrowthDashboardPage() {
  redirect("/my-journey");
}
