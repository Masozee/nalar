import NavBar from "@/components/NavBar";
import Publications from "@/components/Publications";
import News from "@/components/News";
import Events from "@/components/Events";
import Podcasts from "@/components/Podcasts";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="pt-20">
        <Publications />
        <News />
        <Events />
        <Podcasts />
        <Dashboard />
      </main>
      <Footer />
    </>
  );
}
