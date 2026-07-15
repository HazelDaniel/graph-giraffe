import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Partners } from "./components/partners";
import { About } from "./sections/about";
import { AllYouNeed } from "./sections/all-you-need";
import { Testimonials } from "./sections/testimonials";

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Partners />
      <About />
      <AllYouNeed />
      <Testimonials />
      <Partners />
      <Footer />
    </>
  );
}

export default App;
