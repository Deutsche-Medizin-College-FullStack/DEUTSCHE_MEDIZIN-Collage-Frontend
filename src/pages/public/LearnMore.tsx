import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-120px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12 mb-12"
        >
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <h1 className="relative text-4xl md:text-5xl font-bold tracking-tight text-center">
            Deutsche Hochschule für Medizin College (DHMC)
          </h1>
          <p className="relative mt-4 text-center text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Leading private medical institution in Ethiopia. Established in Bahir Dar, DHMC advances healthcare through excellent education, impactful research, and community service.
          </p>
        </motion.div>

        {/* Vision Section */}
        <FadeInSection className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Vision</h2>
          <p className="leading-8 text-lg">
            The college aspires to become a leading private higher learning Medical institution and center of excellence by offering quality education and training accompanied by research activities so as to produce competent medical doctors who can provide top health services in rural and urban settings of our country by the year 2030.
          </p>
        </FadeInSection>

        {/* Mission Section */}
        <FadeInSection className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Mission</h2>
          <div className="space-y-4">
            <p className="leading-8 text-lg">
              To produce Medical professionals capable of providing integrated health services to communities in rural and urban settings.
            </p>
            <p className="leading-8 text-lg">
              To enable the health professionals to have the understanding of intellectual skill, attitudes to practice and a habit of lifelong learning necessary for a constant and promising development in health services in the future.
            </p>
            <p className="leading-8 text-lg">
              To be directly engaged in creation, transformation and evaluation of knowledge in the pursuit of excellence in academic scholarship and intellectual inquiry through teaching, research and provision of advisory and public services.
            </p>
          </div>
        </FadeInSection>

        {/* Values Section */}
        <FadeInSection className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Values</h2>
          <p className="leading-8 text-lg mb-4">
            The college has the following core values:
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">1. Excellence</h3>
              <p className="leading-7">
                Striving for standards in teaching, research, community service and endeavors to exceed the expectations of stakeholders and attain highest standards in academic performance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">2. Academic Freedom</h3>
              <p className="leading-7">
                Committed to provide the college community the right to exercise free expression of ideas and opinions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">3. Respect</h3>
              <p className="leading-7">
                Valuing integrity, fairness, justice, honesty and culture of teamwork.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">4. Accountability and positivity</h3>
              <p className="leading-7">
                Believing in commitment to results and accountability for actions; valuing positive teamwork environment and celebrating successes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">5. Diversity</h3>
              <p className="leading-7">
                Committed to cultural diversity among college community; ensure a respectful, ethical academic environment and principles of gender equality.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">6. Collaboration and communication</h3>
              <p className="leading-7">
                Believing in teamwork, partnership and listening to stakeholders' opinion; ensure accurate and timely communication.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">7. Teaching and Learning</h3>
              <p className="leading-7">
                Committed to professional development and personal growth of staffs and stakeholders.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">8. Students Centeredness</h3>
              <p className="leading-7">
                Committed to provide academic challenge and support in learning environment that motivates students to be actively engaged in learning, decision making and governance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">9. Education, Research, Clinical and community engagement</h3>
              <p className="leading-7">
                Committed to support the four pillars of the college to highest standards and ensure commitment to serve the community, country and the world through medical care and health education.
              </p>
            </div>
          </div>
        </FadeInSection>

        {/* Educational Objectives Section */}
        <FadeInSection className="rounded-xl border border-border bg-card/50 backdrop-blur p-6">
          <h2 className="text-2xl font-bold mb-6 text-primary">Educational Objectives</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-primary">1. General Objectives</h3>
            <ul className="list-disc ml-5 space-y-3">
              <li className="leading-7 text-lg">
                To provide students with both theoretical and practical trainings to Medical doctors,
              </li>
              <li className="leading-7 text-lg">
                To provide a comprehensive understanding of the processes and goals of the entire health professionals
              </li>
              <li className="leading-7 text-lg">
                To prepare students not only for a career in medical, and other health professions but to equip them with the skills and competencies needed for discharging their responsibilities.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">2. Specific Objectives</h3>
            <ul className="list-disc ml-5 space-y-3">
              <li className="leading-7 text-lg">
                To teach and train medical students to become not only highly competent doctors but also appreciate the value of lifelong learning.
              </li>
              <li className="leading-7 text-lg">
                To make them equipped with good communication skills and to understand the important of resource management;
              </li>
              <li className="leading-7 text-lg">
                To enable the graduating medical students to provide the highest standards of clinical service;
              </li>
              <li className="leading-7 text-lg">
                To enable the graduates conduct scholarly research in the clinical, biomedical and public health spheres;
              </li>
              <li className="leading-7 text-lg">
                To train medical students who will be active in community health activities. Short attachments, detachments or electives shall be provided to psychiatry, ophthalmology, radiology, dermatology and ENT depending on diseases pattern and Institutional preparedness. The clinical teaching shall include practical and self-directed learning opportunities. Students should have enough exposure to patients to acquire knowledge, attitude & skills necessary to assume clinical responsibility upon graduation. In order to enhance learning, coaching of skills should be emphasized.
              </li>
              <li className="leading-7 text-lg">
                In clinical years, more student-centered and problem- oriented teaching method shall be employed.
              </li>
            </ul>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}