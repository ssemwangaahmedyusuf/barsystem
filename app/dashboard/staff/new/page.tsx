export default function NewStaffPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add Staff</h1>
      <div className="mt-6 max-w-md">
        <StaffForm />
      </div>
    </div>
  );
}

import StaffForm from "./StaffForm";
