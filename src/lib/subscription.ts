export const BOTS_FRIEND_UNTIL = "24/08/26";
export const BOTS_FRIEND_TOOLTIP = `подписка успешно оплачена до ${BOTS_FRIEND_UNTIL}`;

export type PricingPlan = {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  price: string;
  included: string[];
  cta: string;
  featured?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "newbie",
    eyebrow: "newbie",
    name: "First bot",
    description: "Perfect for first-timers who want to test the waters with a single chatbot.",
    price: "Free / $0",
    included: [
      "1 active chatbot",
      "1 .txt file upload per bot",
      "Up to 100 messages per month",
      "No customization",
      "Community support",
    ],
    cta: "Get started free →",
  },
  {
    id: "bots-friend",
    eyebrow: "bots' friend",
    name: "Team Player",
    description: "For growing teams who need multiple assistants across different projects.",
    price: "$19 / month",
    included: [
      "Up to 5 active chatbots",
      "5 .txt file uploads per bot",
      "Up to 5,000 messages per month",
      "Enhanced customization",
      "Email support within 24 hours",
    ],
    cta: "Start 14-day trial →",
    featured: true,
  },
  {
    id: "black-belt",
    eyebrow: "black belt",
    name: "Enterprise",
    description: "Unlimited power for power users who want full control and priority support.",
    price: "$49 / month",
    included: [
      "Unlimited active chatbots",
      "Unlimited .txt file uploads per bot",
      "Unlimited messages per month",
      "Full customization",
      "Priority support within 2 hours",
    ],
    cta: "Contact sales →",
  },
];
