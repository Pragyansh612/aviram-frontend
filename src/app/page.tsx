import Topbar from "@/components/Topbar";
import Rail from "@/components/Rail";
import Hero from "@/components/Hero";
import Discovery from "@/components/Discovery";
import Scoring from "@/components/Scoring";
import Intel from "@/components/Intel";
import Rejection from "@/components/Rejection";
import Tailor from "@/components/Tailor";
import Referral from "@/components/Referral";
import Applied from "@/components/Applied";
import Summary from "@/components/Summary";
import Handoff from "@/components/Handoff";
import Control from "@/components/Control";
import Explain from "@/components/Explain";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";
import Ambient from "@/components/Ambient";

export default function Home() {
  return (
    <>
      <Topbar />
      <Rail />
      <div className="wrap" id="top">
        <Hero />
        <Discovery />
        <Scoring />
        <Intel />
        <Rejection />
        <Tailor />
        <Referral />
        <Applied />
        <Summary />
        <Handoff />
        <Control />
        <Explain />
        <Closing />
        <Footer />
      </div>
      <Ambient />
    </>
  );
}