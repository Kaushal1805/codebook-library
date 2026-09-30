import { BookForm } from "@/components/admin/BookForm";

export const metadata = {
  title: "Add New Book — CodeBook Admin",
};

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <BookForm isEdit={false} />
    </div>
  );
}
