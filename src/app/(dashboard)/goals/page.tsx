import { redirect } from "next/navigation";

// Redirect old /goals route to the unified /my-journey page
export default function GoalsPage() {
  redirect("/my-journey");
}
