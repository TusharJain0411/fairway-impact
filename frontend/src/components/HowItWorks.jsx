import "../styles/how-it-works.css"
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Subscribe",
      description: "Choose a monthly or yearly Digital Heroes membership.",
    },
    {
      number: "02",
      title: "Add your scores",
      description: "Enter and manage your latest five Stableford golf scores.",
    },
    {
      number: "03",
      title: "Support and win",
      description: "Support a charity and join the monthly prize draw.",
    },
  ];

  return (
    <section className="how-section" id="how-it-works">
      <p className="eyebrow">HOW IT WORKS</p>
      <h2>Golf. Give. Get rewarded.</h2>

      <div className="steps">
        {steps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
