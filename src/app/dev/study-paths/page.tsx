"use client";
import { EducationBrowser } from "@/components/education-browser/education-browser";

export default function StudyPathsDev() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <div>
        <h2 className="mb-2 font-semibold">doctor (has domestic programmes + Europe row)</h2>
        <EducationBrowser careerTitle="Doctor" careerId="doctor" country="NO" />
      </div>
      <div>
        <h2 className="mb-2 font-semibold">astronaut (likely no domestic programmes → local fallback + Europe)</h2>
        <EducationBrowser careerTitle="Astronaut" careerId="astronaut" country="NO" />
      </div>
    </div>
  );
}
