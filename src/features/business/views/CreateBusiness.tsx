import { GalleryVerticalEnd } from "lucide-react";

export default function CreateBusiness() {
  return (
    <section className="flex h-screen w-full flex-col bg-gray-100 p-8">
      <header className="flex gap-5">
        <div className="bg-primary text-sidebar-primary-foreground flex aspect-square h-12 w-12 items-center justify-center rounded-lg">
          <GalleryVerticalEnd className="size-6 text-white" />
        </div>
        <h1 className="flex items-center text-2xl font-semibold">Calth</h1>
      </header>
    </section>
  );
}
