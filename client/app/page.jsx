import React from 'react';
import BackgroundVideo from '@/components/backgroundvideo';
import Countdown from '@/components/coutdown';
import { ChartNoAxesCombined, LibraryBig, Heart, TrendingUp, View, ClipboardCheck, Rocket, Satellite, Antenna } from "lucide-react";

export default function Home() {
  // Target date for the next launch
  const nextLaunchDate = new Date("2025-05-05T00:00:00Z");

  const textColor = "text-slate-500";
  const textHighlight = "text-sky-800";
  const bgColor = "bg-blue-50";

  return (
    <div>
      <div className="relative h-screen overflow-hidden rounded-2xl">
        <BackgroundVideo path="/videos/space_launches_4k.mp4" type="video/mp4" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black bg-opacity-50">
          <Countdown targetDate={nextLaunchDate} />
        </div>
      </div>

      <div className={`container mt-8 mx-auto px-4 py-8 ${textColor}`}>
        <div className="flex items-center space-x-4">
          <ChartNoAxesCombined className="w-8 h-8" /> 
          <h1 className="text-4xl font-mono text-start">Our Stats</h1>
        </div>
        <div className="flex items-center justify-center">
          <div className="stats stats-vertical lg:stats-horizontal shadow m-8 mx-auto">
            {/* Total likes */}
            <div className="stat">
              <div className={`stat-figure ${textHighlight}`}>
                <Heart className='w-8 h-8' />
              </div>
              <div className="stat-title">Total likes</div>
              <div className={`stat-value ${textHighlight}`}>25.6K</div>
              <div className={`stat-desc ${textHighlight}`}>
                <div className='flex items-center space-x-2'>
                  <TrendingUp className='w-4 h-4' />
                  <span>21% to last month</span>
                  </div>
              </div>
            </div>

            {/* Page views */}
            <div className="stat">
              <div className={`stat-figure ${textHighlight}`}>
                <View className='w-8 h-8' />
              </div>
              <div className="stat-title">Page views</div>
              <div className={`stat-value ${textHighlight}`}>1.2M</div>
              <div className={`stat-desc ${textHighlight}`}>
                <div className='flex items-center space-x-2'>
                  <TrendingUp className='w-4 h-4' />
                  <span>15% to last month</span>
                </div>
              </div>
            </div>

            {/* Mission success rate */}
            <div className="stat">
              <div className={`stat-figure ${textHighlight}`}>
                <ClipboardCheck className='w-8 h-8' />
              </div>
              <div className="stat-title">Mission success rate</div>
              <div className={`stat-value ${textHighlight}`}>98%</div>
              <div className={`stat-desc ${textHighlight}`}>
                Massive operational efficiency 
              </div>
            </div>

            {/* Total launches */}
            <div className="stat">
              <div className={`stat-figure ${textHighlight}`}>
                <Rocket className='w-8 h-8' />
              </div>
              <div className="stat-title">Total launches</div>
              <div className={`stat-value ${textHighlight}`}>448</div>
              <div className={`stat-desc ${textHighlight}`}>405 Successful missions to date</div>
            </div>

            {/* Satellites deployed */}
            <div className="stat">
              <div className={`stat-figure ${textHighlight}`}>
                <Satellite className='w-8 h-8' />
              </div>
              <div className="stat-title">Satellites deployed</div>
              <div className={`stat-value ${textHighlight}`}>2.3K</div>
              <div className={`stat-desc ${textHighlight}`}>
                <div className='flex items-center space-x-2'>
                  <Antenna className='w-4 h-4' />
                  <span>Including 1.6K Starlink satellites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='divider mx-12'/>

      <div className={`container mt-8 mx-auto px-4 py-8 ${textColor}`}>
        <div className="flex items-center space-x-4">
          <LibraryBig className="w-8 h-8" />
          <h1 className="text-4xl font-mono text-start">Our Story</h1>
        </div>
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
          {/* 1. Foundation of Celestial Innovations */}
          <li>
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">March 15, 2002</time>
              <div className="text-lg font-black">Foundation of Celestial Innovations</div>
              Celestial Innovations was born on March 15, 2002, when a group of visionary engineers and entrepreneurs gathered with one shared dream: to make space accessible and affordable. Starting out in a modest facility on the outskirts of Los Angeles, the company set its sights on revolutionizing space travel by developing advanced propulsion systems, lightweight composite materials, and innovative design philosophies. This founding moment laid the groundwork for an ambitious future—one that would eventually see the launch of fully reusable rockets and human-rated spacecraft.
            </div>
            <hr />
          </li>

          {/* 2. Mercury Mk-I: The First Suborbital Test Flight */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">June 27, 2004</time>
              <div className="text-lg font-black">Mercury Mk-I: The First Suborbital Test Flight</div>
              Two years after its inception, Celestial Innovations achieved a major milestone with the Mercury Mk-I, its first experimental rocket designed for suborbital flight. On June 27, 2004, the Mercury Mk-I soared briefly into space, proving the viability of the company’s innovative design approach. Utilizing streamlined aerodynamics, advanced onboard computer systems, and novel composite materials, the mission delivered critical data on propulsion efficiency and structural integrity. This test flight not only validated key technologies but also set the stage for more daring missions to come.
            </div>
            <hr />
          </li>

          {/* 3. Orion Launch Vehicle: Reaching Orbit */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">September 12, 2008</time>
              <div className="text-lg font-black">Orion Launch Vehicle: Reaching Orbit</div>
              Learning from early tests, Celestial Innovations introduced the Orion Launch Vehicle in 2008—its first rocket capable of reaching orbit. The Orion was a modular system designed to maximize payload efficiency while maintaining rigorous safety standards. On September 12, 2008, it successfully delivered a suite of scientific instruments into low Earth orbit, proving the company’s capability to undertake orbital missions. This achievement marked the company’s transition from experimental launches to reliable, revenue-generating operations, opening up opportunities in both commercial and governmental markets.
            </div>
            <hr />
          </li>

          {/* 4. Phoenix Booster: The Reusability Breakthrough */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">November 3, 2010</time>
              <div className="text-lg font-black">Phoenix Booster: The Reusability Breakthrough</div>
              On November 3, 2010, Celestial Innovations reshaped the future of space travel with the Phoenix Booster—a breakthrough in reusable rocket technology. Engineered to perform a controlled vertical landing after completing its mission, the Phoenix Booster demonstrated advanced heat-resistant materials and precision guidance systems. Its successful recovery and refurbishment significantly reduced launch costs and underscored the company’s commitment to sustainable, environmentally friendly space exploration. This innovation set new industry benchmarks and paved the way for a new era of cost-effective space logistics.
            </div>
            <hr />
          </li>

          {/* 5. First Commercial Satellite Launch */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">April 18, 2012</time>
              <div className="text-lg font-black">First Commercial Satellite Launch</div>
              April 18, 2012, marked Celestial Innovations’ entrance into the commercial space market. By launching a state-of-the-art communications satellite using the proven Orion Launch Vehicle combined with Phoenix Booster’s reusability, the company showcased its ability to deliver dependable orbital services at competitive prices. This mission validated not only the technical prowess of the company but also its business model—demonstrating that cutting-edge technology could meet the demanding schedules and budgets of commercial partners worldwide.
            </div>
            <hr />
          </li>

          {/* 6. Pegasus-1: The Inaugural Manned Mission */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">July 22, 2015</time>
              <div className="text-lg font-black">Pegasus-1: The Inaugural Manned Mission</div>
              In a historic leap forward, Celestial Innovations launched Pegasus-1 on July 22, 2015—their first manned mission to low Earth orbit. Designed with comprehensive life support systems, ergonomic controls, and stringent safety protocols, Pegasus-1 carried a crew of astronauts on a mission that blended scientific research with the thrill of human spaceflight. This mission served as a proving ground for long-duration space travel, igniting public interest in space tourism and laying the technological and operational groundwork for future human exploration beyond Earth.
            </div>
            <hr />
          </li>

          {/* 7. Artemis Pathfinder: Pioneering Mars Exploration */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">March 3, 2018</time>
              <div className="text-lg font-black">Artemis Pathfinder: Pioneering Mars Exploration</div>
              Pushing the boundaries of interplanetary exploration, Celestial Innovations launched Artemis Pathfinder on March 3, 2018. This unmanned mission was meticulously designed to study Mars’s atmosphere, surface conditions, and potential landing sites for future manned missions. Equipped with autonomous landing systems and a suite of scientific instruments, Artemis Pathfinder transmitted unprecedented data back to Earth, fueling international research initiatives and solidifying the company’s reputation as a trailblazer in Mars exploration.
            </div>
            <hr />
          </li>

          {/* 8. Celestia Orbital Habitat: A New Era in Space Living */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">August 14, 2021</time>
              <div className="text-lg font-black">Celestia Orbital Habitat: A New Era in Space Living</div>
              On August 14, 2021, Celestial Innovations pushed the envelope once again by launching Celestia—its first orbital habitat. Designed to support long-duration human stays, Celestia features modular living quarters, advanced life support systems, and on-board research laboratories. This state-of-the-art habitat serves as both a research platform and a stepping stone towards establishing a permanent human presence in orbit. It has already hosted a series of international experiments in microgravity, fostering collaboration across borders and disciplines.
            </div>
            <hr />
          </li>

          {/* 9. Odyssey: The Reusable Interplanetary Transport System */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">December 2, 2023</time>
              <div className="text-lg font-black">Odyssey: The Reusable Interplanetary Transport System</div>
              Unveiled on December 2, 2023, the Odyssey system represents Celestial Innovations’ most ambitious leap yet—a fully reusable rocket system engineered for interplanetary missions. Odyssey combines breakthrough propulsion technology with adaptive reentry controls and modular payload configurations to serve missions to Mars, the Moon, and beyond. This system drastically cuts the cost per launch while increasing turnaround times and mission reliability. Odyssey has redefined the logistics of deep space exploration, promising a future where routine interplanetary travel is within reach.
            </div>
            <hr />
          </li>

          {/* Future Events */}

          {/* 10. Nova Station: The Orbital Commercial Hub */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">Scheduled for Q3 2027</time>
              <div className="text-lg font-black">Nova Station: The Orbital Commercial Hub</div>
              Nova Station is Celestial Innovations’ next flagship project—a multipurpose orbital platform designed to serve as a commercial, research, and tourism hub in low Earth orbit. Featuring expansive docking ports, customizable laboratories, and comfortable living accommodations, Nova Station will facilitate everything from microgravity research to in-space manufacturing and private space tourism. Announced with great enthusiasm at the Global Aerospace Summit, this ambitious project is set to transform the economic landscape of space by creating a sustainable and versatile environment for commercial activities.
            </div>
            <hr />
          </li>

          {/* 11. Lunar Gateway 2.0: Next-Generation Lunar Base */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <time className="font-mono italic">Targeted for 2029</time>
              <div className="text-lg font-black">Lunar Gateway 2.0: Next-Generation Lunar Base</div>
              Building on a legacy of lunar exploration, Lunar Gateway 2.0 is slated to become the next-generation habitat on the Moon. Scheduled for deployment in 2029, this modular base will integrate cutting-edge in-situ resource utilization, energy production, and waste recycling technologies to support extended human presence. Designed to serve as both a research outpost and a logistics hub for deeper space missions, Lunar Gateway 2.0 aims to be a cornerstone of international efforts to create a sustainable human foothold on the lunar surface.
            </div>
            <hr />
          </li>

          {/* 12. Mars Colony Initiative: Red Frontier */}
          <li>
            <hr />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end md:mb-10">
              <time className="font-mono italic">Planned for 2035</time>
              <div className="text-lg font-black">Mars Colony Initiative: Red Frontier</div>
              Capping off Celestial Innovations’ visionary roadmap is the Mars Colony Initiative, codenamed Red Frontier. Planned for 2035, this initiative outlines an ambitious blueprint for establishing the first self-sustaining human colony on Mars. The project envisions resilient habitat modules, renewable energy systems, and innovative agricultural technologies specifically adapted for the Martian environment. Red Frontier is not only a milestone in human exploration but also a bold step toward ensuring the long-term survival and expansion of our species beyond Earth.
            </div>
          </li>
        </ul>

      </div>
    </div>
  );
};
