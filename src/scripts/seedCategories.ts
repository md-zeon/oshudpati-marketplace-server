import { prisma } from "../lib/prisma";

const categoriesToSeed = [
  {
    name: "Cold & Allergy Relief",
    description:
      "Antihistamines, decongestants, and multi-symptom cold formulas to relieve runny nose, sneezing, nasal congestion, and seasonal allergy symptoms. Includes both daytime non-drowsy and nighttime formulas.",
    imageUrl:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Cough & Sore Throat",
    description:
      "Cough suppressants, expectorants, throat lozenges, and soothing sprays for dry cough, chest congestion, and sore or scratchy throats. Includes honey-based and menthol formulations.",
    imageUrl:
      "https://images.unsplash.com/photo-1611186871348-b1f696febc20?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Digestive Health",
    description:
      "Laxatives for constipation relief, anti-diarrheal medications, digestive enzyme supplements, and probiotics to support a healthy gut microbiome and regular bowel movements.",
    imageUrl:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Vitamins & Minerals",
    description:
      "Daily multivitamins, vitamin D3, B-complex, vitamin C, calcium, magnesium, iron, zinc, and other essential dietary supplements to fill nutritional gaps and support overall wellness.",
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Pain Relief (Muscle & Joint)",
    description:
      "Topical analgesics, muscle rubs, anti-inflammatory creams, and oral pain relievers for body aches, back pain, muscle strains, joint stiffness, and arthritis discomfort.",
    imageUrl:
      "https://images.unsplash.com/photo-1642484991979-6fbaa5680504?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "First Aid & Wound Care",
    description:
      "Antiseptic solutions, antibiotic ointments, adhesive bandages, sterile gauze, medical tape, wound dressings, and急救 kits for minor cuts, scrapes, burns, and injuries.",
    imageUrl:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Skin Care & Dermatology",
    description:
      "Antifungal creams for athlete's foot and ringworm, anti-acne treatments, moisturizing lotions, hydrocortisone anti-itch creams, and broad-spectrum sunscreens for everyday skin protection.",
    imageUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Eye & Ear Care",
    description:
      "Artificial tears and lubricating eye drops for dry eyes, antihistamine eye drops for allergy relief, ear wax removal drops, and gentle ear irrigation solutions.",
    imageUrl:
      "https://images.unsplash.com/photo-1585435557343-3b7f0bb5b0e9?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Baby & Child Health",
    description:
      "Pediatric vitamins and supplements, teething gels and numbing agents, infant gas relief drops, child-safe fever reducers, electrolyte solutions, and gentle diaper rash creams.",
    imageUrl:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Women's Health",
    description:
      "Feminine hygiene products, yeast infection treatments, urinary tract health supplements, menstrual pain relief, prenatal vitamins, and pH-balancing intimate care solutions.",
    imageUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Allergy & Sinus Care",
    description:
      "Saline nasal sprays and rinses for sinus irrigation, corticosteroid nasal sprays, oral antihistamines, and sinus decongestant tablets for long-term allergy and sinusitis management.",
    imageUrl:
      "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Heart Health & Circulation",
    description:
      "Low-dose aspirin therapy for heart health, omega-3 fatty acid supplements, CoQ10 for cardiovascular support, and circulation boosters. Blood pressure monitors also available separately.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Diabetes Care",
    description:
      "Blood glucose monitoring systems, test strips, lancets, lancing devices, diabetic foot care creams and socks, sugar-free supplements, and glucose tablets for hypoglycemia management.",
    imageUrl:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop",
  },
];

async function seedCategories() {
  try {
    console.log("***** Category Seeding Started....");

    const existingCount = await prisma.category.count();
    console.log(`***** Existing categories in DB: ${existingCount}`);

    const data = categoriesToSeed.map((cat) => ({
      name: cat.name,
      slug: cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      description: cat.description,
      imageUrl: cat.imageUrl,
      isActive: true,
    }));

    const result = await prisma.category.createMany({
      data,
      skipDuplicates: true,
    });

    console.log(`***** ${result.count} new categories created successfully!`);
    console.log(
      `***** Categories that already existed (same slug) were skipped.`,
    );
    console.log("******* SUCCESS ******");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
