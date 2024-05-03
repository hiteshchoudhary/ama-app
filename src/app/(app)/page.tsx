import MessageCarousel from "@/components/CarouselContent";
import { auth } from "@/app/auth";
export default async function Home() {
  const year = new Date().getFullYear();
  const session = await auth();

  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>
        <MessageCarousel />
        {JSON.stringify(session, null, 2)}
      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
        © {year} True Feedback. All rights reserved.
      </footer>
    </>
  );
}
