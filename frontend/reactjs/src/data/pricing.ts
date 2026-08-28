import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 9,
        period: "month",
        features: [
            "100 AI thumbnails/mo",
            "Basic Templates",
            "Standard Resolution",
            "No Watermark",
            "Email support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 29,
        period: "month",
        features: [
            "Unlimited AI Thumbnails",
            "Premium Support",
            "4K Resolution",
            "A/B Testing Tools",
            "Priority Support",
            "Custom Fonts",
            "Brand Kir Analysis"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 79,
        period: "month",
        features: [
            "Everything in Pro",
            "API Access",
            "Team Collaborations",
            "Custom Branding",
            "Dedicated Account Manager"
        ],
        mostPopular: false
    }
];