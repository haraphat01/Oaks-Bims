import { PropertyForm } from "@/components/admin/property-form";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-semibold">New property</h1>
      <PropertyForm mode="create" />
    </div>
  );
}
