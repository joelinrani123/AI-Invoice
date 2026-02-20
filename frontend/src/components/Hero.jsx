import React from "react";
import { useNavigate } from "react-router-dom";
import { useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { heroStyles } from "../assets/dummyStyles";

const Hero = () => {
  const navigate = useNavigate();
  const clerk = useClerk();

  const handleSignedInPrimary = () => {
    navigate("/app/create-invoice");
  };

  const handleSignedOutPrimary = () => {
    if (clerk?.openSignUp) {
      clerk.openSignUp();
    }
  };

  return (
    <section className={heroStyles.section}>
      {/* Background */}
      <div className={heroStyles.bgElement1} />
      <div className={heroStyles.bgElement2} />
      <div className={heroStyles.bgElement3} />
      <div className={heroStyles.gridPattern} />

      <div className={heroStyles.container}>
        <div className={heroStyles.grid}>
         {/* left */}
          <div className={heroStyles.content}>
            <div className={heroStyles.contentInner}>
              <div className={heroStyles.badge}>
                <div className={heroStyles.badgeDot} />
                <span className={heroStyles.badgeText}>
                  AI-Powered Invoicing Platform
                </span>
              </div>

              <h1 className={heroStyles.heading}>
                <span className={heroStyles.headingLine1}>Professional</span>
                <br />
                <span className={heroStyles.headingLine2}>Invoices</span>
                <br />
                <span className={heroStyles.headingLine3}>in Seconds</span>
              </h1>

              <p className={heroStyles.description}>
                Transform conversations into professional invoices with AI.{" "}
                <span className={heroStyles.descriptionHighlight}>
                  Paste any text
                </span>{" "}
                and watch AI extract items, calculate totals, and generate
                ready-to-send invoices instantly.
              </p>
            </div>

            {/* CTA */}
            <div className={heroStyles.ctaContainer}>
              <SignedIn>
                <button
                  onClick={handleSignedInPrimary}
                  className={heroStyles.primaryButton}
                >
                  <div className={heroStyles.primaryButtonOverlay} />
                  <span className={heroStyles.primaryButtonText}>
                    Start Creating Free
                  </span>
                  <svg
                    className={heroStyles.primaryButtonIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </SignedIn>

              <SignedOut>
                <button
                  onClick={handleSignedOutPrimary}
                  className={heroStyles.primaryButton}
                >
                  <div className={heroStyles.primaryButtonOverlay} />
                  <span className={heroStyles.primaryButtonText}>
                    Start Creating Free
                  </span>
                  <svg
                    className={heroStyles.primaryButtonIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </SignedOut>

              <a href="#features" className={heroStyles.secondaryButton}>
                <span>Explore Features</span>
                <svg
                  className={heroStyles.secondaryButtonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>

{/* features */}
            <div className={heroStyles.featuresGrid}>
              {[
                { icon: "🤖", label: "AI-Powered", desc: "Smart text parsing" },
                { icon: "⚡", label: "Lightning Fast", desc: "Generate in seconds" },
                { icon: "🎨", label: "Professional", desc: "Branded templates" },
              ].map((f, i) => (
                <div key={i} className={heroStyles.featureItem}>
                  <div className={heroStyles.featureIcon}>{f.icon}</div>
                  <div>
                    <div className={heroStyles.featureLabel}>{f.label}</div>
                    <div className={heroStyles.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right  */}
          <div className={heroStyles.demoColumn}>
            <div className={heroStyles.demoFloating1} />
            <div className={heroStyles.demoFloating2} />

            <div className={heroStyles.demoContainer}>
              {/* card */}
              <div className={heroStyles.demoCard}>
                <div className={heroStyles.cardHeader}>
                  <div className={heroStyles.cardLogoContainer}>
                    <div className={heroStyles.cardLogo}>AI</div>
                    <div>
                      <div className={heroStyles.cardClientName}>
                        Joe Corporation
                      </div>
                      <div className={heroStyles.cardClientGst}>
                        GST: 27AAAPL1234C1ZV
                      </div>
                    </div>
                  </div>

                  <div className={heroStyles.cardInvoiceHeader}>
                    <div>
                      <div className={heroStyles.cardInvoiceLabel}>
                        Invoice
                      </div>
                      <div className={heroStyles.cardInvoiceNumber}>
                        #INV-1024
                      </div>
                    </div>
                    <div className={heroStyles.cardStatus}>Paid</div>
                  </div>
                </div>

                {/* items */}
                <div className={heroStyles.itemsContainer}>
                  {[
                    {
                      description: "Website Design & Development",
                      amount: "₹15,000",
                    },
                    {
                      description: "Consultation (2 hours)",
                      amount: "₹3,000",
                    },
                    {
                      description: "Premium Hosting Setup",
                      amount: "₹2,500",
                    },
                  ].map((item, i) => (
                    <div key={i} className={heroStyles.itemRow}>
                      <div className={heroStyles.itemLeft}>
                        <div className={heroStyles.itemDot} />
                        <span className={heroStyles.itemDescription}>
                          {item.description}
                        </span>
                      </div>
                      <span className={heroStyles.itemAmount}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* totals*/}
                <div className={heroStyles.calculationContainer}>
                  <div className={heroStyles.calculationRow}>
                    <span className={heroStyles.calculationLabel}>Subtotal</span>
                    <span className={heroStyles.calculationValue}>₹20,500</span>
                  </div>
                  <div className={heroStyles.calculationRow}>
                    <span className={heroStyles.calculationLabel}>
                      GST (18%)
                    </span>
                    <span className={heroStyles.calculationValue}>₹3,240</span>
                  </div>
                  <div className={heroStyles.totalRow}>
                    <span className={heroStyles.totalLabel}>Total Amount</span>
                    <span className={heroStyles.totalValue}>₹23,740</span>
                  </div>
                </div>

{/* actions */}
                <div className={heroStyles.actionButtons}>
                  <button className={heroStyles.previewButton}>
                    <span className={heroStyles.previewButtonText}>
                      Preview
                    </span>
                  </button>
                  <button className={heroStyles.sendButton}>
                    <span className={heroStyles.sendButtonText}>
                      Send Invoice
                    </span>
                  </button>
                </div>
              </div>

{/* ai parsed */}
              <div className={heroStyles.aiIndicator}>
                <div className={heroStyles.aiIndicatorContent}>
                  <div className={heroStyles.aiIndicatorDot} />
                  <span>AI<br></br> parsed from:</span>
                  <span className={heroStyles.aiIndicatorText}>
                    "Invoice for web design – ₹15,000..."
                  </span>
                </div>
              </div>

{/* card decor */}
              <div className={heroStyles.cornerAccent1} />
              <div className={heroStyles.cornerAccent2} />
              <div className={heroStyles.cardBackground} />
            </div>
          </div>
        </div>
      </div>

{/* scroll indicator */}
      <div className={heroStyles.scrollIndicator}>
        <div className={heroStyles.scrollContainer}>
          <span className={heroStyles.scrollText}>Scroll to explore</span>
          <div className={heroStyles.scrollBar}>
            <div className={heroStyles.scrollDot} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
