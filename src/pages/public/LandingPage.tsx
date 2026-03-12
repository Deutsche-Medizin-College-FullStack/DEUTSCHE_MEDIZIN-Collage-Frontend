import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import Lottie from "lottie-react";
import DarkVeil from "@/designs/DarkVeil";
import LiquidChrome from "@/designs/LiquidChrome";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import home from "../../../public/animations/home.json";
import phone from "../../../public/animations/phone.json";
import register from "../../../public/animations/register.json";
import calling from "../../../public/animations/calling.json";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GraduationCap, Heart, Eye, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
//design pages
import TrueFocus from "@/designs/TrueFocus";
import GlareHover from "@/designs/GlareHover";
import CircularGallery from "../../designs/CircularGallery";
import LightRays from "@/designs/LightRays";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import CountUp from "react-countup";

// ScreenSizeDebugger Component
function ScreenSizeDebugger() {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}

export default function LandingPage() {
  const [show, setShow] = useState(false);
  const videoRefs = useRef(null);
  const [isPlayingss, setIsPlayings] = useState(false);

  const handlePlay = () => {
    videoRefs.current.play();
    setIsPlaying(true);
  };
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300); // Show after scrolling 300px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const videoRef = useRef(null); // points to the video element
  const [isPlaying, setIsPlaying] = useState(false); // tracks if video is playing

  const { t } = useTranslation(["common", "auth"]);
  const carouselRef = useRef(null);
  const scrollAmount = 300;

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  const datas = [
    {
      image:
        "https://skyresortbahirdar.com/wp-content/uploads/2021/09/Bahir-Dar-City-View-1-2560x1440.jpg",
      heading: " WHAT WE CAN KNOW",
      detail:
        " Video: Ian McEwan in conversation with Richard Ovenden, book now",
    },
    {
      image:
        "https://skyresortbahirdar.com/wp-content/uploads/2021/09/Bahir-Dar-City-View-1-2560x1440.jpg",
      heading: "FEATURED PODCAST    ",
      detail: "Accelerating AI Ethics",
    },
    {
      image:
        "https://skyresortbahirdar.com/wp-content/uploads/2021/09/Bahir-Dar-City-View-1-2560x1440.jpg",
      heading: "THE OUP BLOG",
      detail: "Your Indo-European beard",
    },
    {
      image:
        "https://skyresortbahirdar.com/wp-content/uploads/2021/09/Bahir-Dar-City-View-1-2560x1440.jpg",
      heading: "FEATURED PODCAST",
      detail: "we have very good products",
    },
  ];
  const homeRef = useRef();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { margin: "-150px" });
  const textRef = useRef(null);
  // Mission Section Ref
  const missionRef = useRef(null);
  const missionInView = useInView(missionRef, { margin: "-150px" });
  const programs = [
    {
      title: "Medicine",
      icon: "https://th.bing.com/th/id/R.e896697aea4207f544f0d3615ec82e61?rik=7Zdqn2%2bf0irguw&pid=ImgRaw&r=0",
      description:
        "Understand the human body structure through detailed study and cadaver labs.",
    },
    {
      title: "Nursing",
      icon: "https://seattlemedium.com/wp-content/uploads/2023/06/Black-Nurses-iStock-748-x-486px.jpg",
      description:
        "Learn the normal functions of the human body in health and disease.",
    },
    {
      title: "Medical Radiology(MRT)",
      icon: "https://tse4.mm.bing.net/th/id/OIP.cJn1IK_5m5sOK1fZam3XMwHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3",
      description:
        "Explore the chemical processes underlying life and metabolism.",
    },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-150px" });
  const infoRef = useRef(null);
  const infoView = useInView(infoRef, { margin: "-150px" });
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen dark:bg-gray-950">
      {/* Screen Size Debugger */}
      <ScreenSizeDebugger />

      {/* DarkVeil Background */}

      <div className="relative z-10">
        {show && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-sky-500 text-white p-3 rounded-full shadow-lg hover:bg-sky-600 transition"
          >
            <ChevronUpIcon className="h-6 w-6" />
          </button>
        )}

        {/* NAVBAR - FIXED VERSION */}
        <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg z-50" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            {/* Logo - Takes less space */}
            
        <div className="flex items-center space-x-2 flex-shrink-0">
          <img
            src="/assets/companylogo.jpg"
            alt="Company Logo"
            className="h-10 w-10 rounded-full object-cover shadow-sm"
          />
          {/* Show full name based on screen size using JavaScript */}
          {windowWidth >= 768 ? (
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              DEUTSCHE HOCHSCHULE FÜR
            </span>
          ) : (
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              DHF
            </span>
          )}
        </div>

            {/* Desktop Navigation - Using CSS media queries as fallback */}
            <div style={{ display: windowWidth >= 768 ? 'flex' : 'none' }} className="items-center space-x-6 justify-end flex-grow">
              <nav className="flex items-center space-x-6">
                <a
                  href="#home"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Home
                </a>
                <a
                  href="#mission"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Mission
                </a>
                <a
                  href="#hero"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Services
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Contact
                </a>
              </nav>
              
              {/* Desktop Utilities */}
              <div className="flex items-center space-x-4 ml-6">
                <LanguageSwitcher />
                <ThemeToggle />
                <Link to="/login">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-sm whitespace-nowrap">
                    Login
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button and Utilities */}
            <div style={{ display: windowWidth < 768 ? 'flex' : 'none' }} className="items-center space-x-4 justify-end flex-grow">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                className="flex items-center text-gray-700 dark:text-gray-200 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (  
            <div style={{ display: windowWidth < 768 ? 'block' : 'none' }} className="fixed inset-0 z-40 bg-white dark:bg-gray-900 mt-16">              
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col p-6 space-y-2 bg-white dark:bg-gray-900">
                <a
                  href="#home"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#mission"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Mission
                </a>
                <a
                  href="#hero"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Services
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </a>
                
                {/* Mobile Login Button */}
                <div className="pt-6 px-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-sm text-lg font-medium">
                      Login
                    </button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Add padding-top to account for fixed header */}
        <div className="pt-16 md:pt-20">
          <section className="relative my-8 bg-gradient-to-r from-blue-900 to-blue-200 text-white h-96 flex items-center ">
            <img
              src="https://skyresortbahirdar.com/wp-content/uploads/2021/09/Bahir-Dar-City-View-1-2560x1440.jpg"
              alt="Student Studying"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 text-left">
              <p className="text-lg mx-8 mb-2 font-serif font-bold">
                In the city of Bahirdar
              </p>
              <h2 className="text-4xl mb-4 bg-gradient-to-r from-blue-900 to-blue-200 px-4 py-2 rounded font-serif">
                <span className="font-bold">DEUTSCHE HOCHSCHULE FÜR MEDIZIN COLLEGE</span> MEDIZIN COLLEGE
              </h2>
            </div>
            <div className="absolute left-0 right-0 bottom-0 mx-auto mb-[-40px] max-w-3xl bg-white bg-white/40 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">About us</p>
              <h2 className="text-xl font-bold uppercase text-blue-600 leading-tight">
              DEUTSCHE HOCHSCHULE FÜR
              <br />
                MEDICIN COLLEGE BAHIRDAR
              </h2>
            </div>
          </section>

          {/* Hero Section */}
<section id="home" className="my-8 container mx-auto px-4 py-10">
  <div
    className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-16"
    ref={heroRef}
  >
    {/* Image - Simple fade in */}
    <motion.div
      className="w-full px-10 py-10 sm:w-2/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src="/assets/companylogo.jpg"
        alt="College Logo"
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0"
      />
    </motion.div>

    {/* Text Content */}
    <div className="w-full sm:w-3/5 text-center sm:text-left max-w-4xl">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
        <div className="text-blue-600">Excellence In</div>
        <div className="text-blue-600">
          <TrueFocus
            sentence="Medical Education"
            manualMode={false}
            blurAmount={5}
            borderColor="red"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
        </div>
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Join our vibrant University College community! Begin your
        academic journey by completing the Life History Form for
        undergraduate admission...
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
        <Link to="/register">
          <Button size="lg" className="text-lg px-8 py-3">
            Apply now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/learn-more">
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-3 bg-transparent"
          >
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  </div>
</section>
       
          <section className="mx-4 sm:mx-20 my-16 md:my-24">
            <div
              ref={infoRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            >
              {/* Left column - Simple fade only */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={infoView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 font-serif mb-4">
                    DEUTSCHE College at a Glance
                  </h2>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-poppins leading-relaxed mb-6">
                    For nearly five years, people have come to DEUTSCHE in the
                    pursuit of truth, knowledge, and the betterment of society.
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src="/assets/collegephoto.jpg"
                    alt="DEUTSCHE College Campus"
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>

              {/* Right column - Simple fade with slight delay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={infoView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-10 lg:space-y-12"
              >
                <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2017</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-serif mb-3">
                    Founded in 2017
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-lg">
                    The year DEUTSCHE was established, beginning our journey of academic excellence.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-serif mb-3">
                    Active Community
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-lg">
                    Hundreds of students currently engaged in transformative learning experiences.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          <section
            id="programs"
            className="container mx-auto px-4 py-24 overflow-hidden"
            ref={ref}
          >
            <motion.h2
              className="text-4xl font-extrabold text-center mb-16 
              bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent 
              drop-shadow-lg tracking-tight"
              initial={{ opacity: 0, x: 200 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 200 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Medical Programs & Courses We Provide
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 place-items-center">
              {programs.map((program, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col overflow-hidden rounded-3xl 
                  bg-white/80 dark:bg-slate-900/80 
                  backdrop-blur-xl border border-slate-200 dark:border-slate-700
                  shadow-xl hover:shadow-2xl 
                  text-center cursor-pointer w-80 h-[32rem] transition-all duration-300"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={
                    inView
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 50, scale: 0.9 }
                  }
                  transition={{
                    duration: 0.7,
                    delay: index * 0.2,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -12,
                  }}
                >
                  {/* Full image large section */}
                  <div className="w-full h-72">
                    <img
                      src={program.icon}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text section smaller */}
                  <div className="flex flex-col items-center p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {program.title}
                    </h3>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                      {program.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section
            id="hero"
            className="relative my-8 h-100 overflow-hidden text-white font-sans"
          >
            {/* Background video */}
            <video
              className="absolute inset-0 w-full h-full object-cover brightness-70"
              src="/assets/video.mp4"
              autoPlay
              loop
              muted
              playsInline
            ></video>

            {/* Floating circles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-blue-400 opacity-15"
                  style={{
                    width: `${60 + i * 25}px`,
                    height: `${60 + i * 25}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{ y: ["0%", "12%", "0%"], x: ["0%", "12%", "0%"] }}
                  transition={{
                    duration: 9 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
              <motion.p
                className="text-2xl md:text-3xl font-medium text-gray-100 mb-6 drop-shadow-lg"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.8, delay: 1.2, ease: "easeOut" }}
              >
                Pursue your dreams in{" "}
                <span className="text-cyan-400 font-bold tracking-wide">
                  Medicine
                </span>{" "}
                and{" "}
                <span className="text-indigo-400 font-bold tracking-wide">
                  Healthcare
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 2.1, ease: "easeOut" }}
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] animate-pulse"
                  >
                    {t("auth:register")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Core Values, Vision, Mission */}
          <section
            id="mission"
            className="container my-8 mx-auto px-4 py-20"
            ref={missionRef}
          >
            <h2
              className="text-4xl font-extrabold text-center mb-16 
              bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent 
              drop-shadow-lg tracking-tight"
            >
              Values And Mission{" "}
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={
                  missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }
                }
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Card className="text-center my-6 bg-white dark:bg-gray-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                  <CardHeader>
                    <img
                      src="/assets/student.jpg"
                      className="h-[200px] w-full object-cover"
                    />
                    <CardTitle className="text-2xl text-blue-600 dark:text-white">
                      Core Values
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      DHMC places education at the core of its vision and
                      mission, guiding all our actions and decisions...
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={
                  missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
                }
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                <Card className="text-center bg-white my-6 dark:bg-gray-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                  <CardHeader>
                    <img
                      src="/assets/laboratory.jpg"
                      className="h-[200px] w-full object-cover"
                    />
                    <CardTitle className="text-2xl text-blue-600 dark:text-white">
                      Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      DHM College envisions becoming the premier center of
                      academic excellence in Ethiopia by the year 2025...
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={
                  missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }
                }
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <Card className="text-center bg-white my-6 dark:bg-gray-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                  <CardHeader>
                    <img
                      src="/assets/intro.jpg"
                      className="h-[200px] w-full object-cover"
                    />
                    <CardTitle className="text-2xl text-blue-600 dark:text-white">
                      Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      DHM College aims to produce competent professionals at
                      different levels relevant to the development needs of the
                      country...
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          <section style={{ textAlign: "left", marginBottom: "60px" }}>
            <h2
              className="text-4xl font-extrabold text-center mb-16 
              bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent 
              drop-shadow-lg tracking-tight"
            >
              Discover More
            </h2>

            <div
              style={{
                position: "relative",
                width: "90%",
                paddingBottom: "90px",
                margin: "0 auto 40px auto",
                paddingTop: `${(1 / 4) * 100}%`,
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRefs}
                src="https://res.cloudinary.com/djz4nl0ic/video/upload/v1759434928/lv_0_20251002223127_jwkzc8.mp4"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "90%",
                  objectFit: "cover",
                }}
                controls={isPlaying}
              />

              {!isPlaying && (
                <button
                  onClick={handlePlay}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#FF0000",
                    border: "none",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="40px"
                    height="40px"
                    style={{ marginLeft: "4px" }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
            </div>
          </section>

          {window.innerWidth > 820 && (
            <div className="relative h-[600px] px-10 ">
              <h2
                className="text-4xl font-extrabold text-center mb-16 
                bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent 
                drop-shadow-lg tracking-tight"
              >
                Our Facilities
              </h2>

              <CircularGallery
                bend={3}
                textColor="#3B82F6"
                borderRadius={0.05}
                scrollEase={0.02}
              />
            </div>
          )}

          <section className="py-26">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-blue-500 dark:text-white mb-4">
                Ready to Start Your Medical Journey?
              </h2>
              <p className="text-xl text-blue-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful graduates who have made their mark in
                the medical field. Your future in healthcare starts here.
              </p>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-3"
                >
                  {t("auth:register")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <div
            id="contact"
            className="relative w-full flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1}
                lightSpread={1}
                rayLength={2}
                pulsating={true}
                fadeDistance={1}
                saturation={1}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0}
                distortion={0}
                className="w-full h-full"
              />
            </div>

            <footer className="text-white py-1">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 rounded-full rounded-lg flex items-center justify-center">
                        <img
                          src="/assets/companylogo.jpg"
                          className="h-[50px] w-full rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="text-gray-500 hover:text-gray-400 dark:text-white font-bold">
                          {t("college.name")}
                        </h3>
                        <p className="text-gray-500 hover:text-gray-400 dark:text-white text-sm text-">
                          {t("college.subtitle")}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-600 hover:text-gray-400">
                      Excellence in medical education since 2017.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-black">
                      <li>
                        <Link
                          to="/register"
                          className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                        >
                          Apply Now
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/login"
                          className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                        >
                          Student Portal
                        </Link>
                      </li>
                      <li>
                        <a
                          href="#programs"
                          className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                        >
                          Programs
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                        >
                          Research
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">{t("contact")}</h4>
                    <ul className="space-y-2 ">
                      <li className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400">
                        Bahirdar Noc
                      </li>
                      <li className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400">
                        Bahirdar, Ethiopia 10115
                      </li>
                      <li className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400">
                        058 22 08 158
                      </li>
                      <li className="text-blue-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400">
                        dochebahirdar@gmail.com
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                  <p>Deutsche Hochschule für Medizin College Bahirdar Website.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}