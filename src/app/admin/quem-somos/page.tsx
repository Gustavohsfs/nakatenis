import { aboutRepo } from "@/lib/data";
import { AboutForm } from "@/components/admin/about-form";

export const metadata = { title: "Quem somos" };

export default async function AdminAboutPage() {
  const about = await aboutRepo.get();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Quem somos</h1>
        <p className="text-[15px] text-ink-muted">
          Edite o texto institucional e a galeria de fotos da loja.
        </p>
      </header>

      <AboutForm about={about} />
    </div>
  );
}
