import { useState } from "react";
import FeatureStrip from "../components/FeatureStrip";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Navbar from "../components/Navbar";
import NoticeUpload from "../components/NoticeUpload";
import { useTheme } from "../hooks/useTheme";

function Home() {
  const [language, setLanguage] = useState("english");
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      id="top"
      className="min-h-screen bg-[#F5F5F5] text-[#202124] font-sans transition-colors duration-200 dark:bg-[#202124] dark:text-[#F5F5F5]"
    >
      {/* Expressive Top Navigation */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content Editorial Composition */}
      <main className="pb-16">
        {/* Asymmetric Desktop Hero */}
        <Hero />

        {/* Creative Document Canvas Upload Workspace */}
        <NoticeUpload language={language} onLanguageChange={setLanguage} />

        {/* Understated 3-Part Feature Strip */}
        <FeatureStrip />

        {/* Concise How It Works */}
        <HowItWorks />
      </main>

      {/* Minimal Editorial Footer */}
      <Footer />
    </div>
  );
}

export default Home;
