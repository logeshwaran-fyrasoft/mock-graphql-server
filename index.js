import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// -----------------------------------------------------------------------
// This is IN-MEMORY mutable state — it simulates "the database".
// When we run the `updateHeroTitle` mutation, this changes.
// That's how we'll simulate "content changed in the backend" for the
// ISR revalidation demo, without needing a real database.
// -----------------------------------------------------------------------
const state = {
  hero: {
    image: 'https://picsum.photos/seed/crea-hero/1200/500',
    subtitle: 'Hand Crafted Bronze and Marble God Statues',
    title: 'Divine Craftsmanship, Delivered to your Door',
  },
  bestSellers: [
    { id: '1', image: 'https://picsum.photos/seed/idol1/300/300', title: 'Lakshmi Brass Idol', price: 6499, mrp: 7499, discountPercent: 13, rating: 4, reviewCount: 536, deliveryDate: 'TODAY' },
    { id: '2', image: 'https://picsum.photos/seed/idol2/300/300', title: 'Varahi Amman Brass Idol', price: 6499, mrp: 7499, discountPercent: 0, rating: 5, reviewCount: 340, deliveryDate: 'Wed, 12/05/2026' },
    { id: '3', image: 'https://picsum.photos/seed/idol3/300/300', title: 'Gold Plated Vinayagar Idol', price: 6499, mrp: 7499, discountPercent: 0, rating: 5, reviewCount: 536, deliveryDate: 'Wed, 12/05/2026' },
    { id: '4', image: 'https://picsum.photos/seed/idol4/300/300', title: 'Hanuman Brass Idol', price: 6499, mrp: 7499, discountPercent: 0, rating: 5, reviewCount: 536, deliveryDate: 'Wed, 12/05/2026' },
  ],
  poojaEssentials: [
    { id: 'pe1', image: 'https://picsum.photos/seed/pe1/300/300', title: 'Incense Sticks - Rose Flavour', price: 6499, mrp: 7499, discountPercent: 0, rating: 4, reviewCount: 586, deliveryDate: 'Wed, 12/05/2026' },
    { id: 'pe2', image: 'https://picsum.photos/seed/pe2/300/300', title: 'Incense Cones', price: 6499, mrp: 7499, discountPercent: 28, rating: 4, reviewCount: 586, deliveryDate: 'Wed, 12/05/2026' },
    { id: 'pe3', image: 'https://picsum.photos/seed/pe3/300/300', title: 'Divine Lamps', price: 6499, mrp: 7499, discountPercent: 0, rating: 5, reviewCount: 586, deliveryDate: 'Wed, 12/05/2026' },
    { id: 'pe4', image: 'https://picsum.photos/seed/pe4/300/300', title: 'Kumkum and Turmeric', price: 6499, mrp: 7499, discountPercent: 12, rating: 5, reviewCount: 586, deliveryDate: 'Wed, 12/05/2026' },
  ],
  promoBanner: {
    title: 'Express Delivery Now Available!',
    subtitle: 'Get your favourite limited pre-orders delivered fresh, safe and on time.',
  },
  // bump this every time data changes, so we can SEE staleness on the frontend
  lastUpdated: new Date().toISOString(),
};

const typeDefs = `#graphql
  type Hero {
    image: String
    subtitle: String
    title: String
  }

  type Product {
    id: ID
    image: String
    title: String
    price: Int
    mrp: Int
    discountPercent: Int
    rating: Int
    reviewCount: Int
    deliveryDate: String
  }

  type PromoBanner {
    title: String
    subtitle: String
  }

  type Homepage {
    hero: Hero
    bestSellers: [Product]
    poojaEssentials: [Product]
    promoBanner: PromoBanner
    lastUpdated: String
  }

  type Query {
    homepage: Homepage
  }

  type Mutation {
    """
    Simulates the backend team changing homepage content.
    Use this to demo ISR staleness + revalidation.
    """
    updateHeroTitle(title: String!): Homepage
  }
`;

const resolvers = {
  Query: {
    homepage: () => state,
  },
  Mutation: {
    updateHeroTitle: (_parent, { title }) => {
      state.hero.title = title;
      state.lastUpdated = new Date().toISOString();
      console.log(`\n[mock-backend] Hero title changed to: "${title}"`);
      console.log(`[mock-backend] lastUpdated: ${state.lastUpdated}\n`);
      return state;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.PORT || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  context: async () => ({}),
});

console.log(`\n🚀 Mock GraphQL server ready`);
console.log(`   Playground: ${url}`);
console.log(`   Endpoint:   ${url}\n`);
console.log(`Try this query in the playground:\n`);
console.log(`query {
  homepage {
    hero { title subtitle }
    lastUpdated
  }
}\n`);
console.log(`Try this mutation to simulate a content change:\n`);
console.log(`mutation {
  updateHeroTitle(title: "NEW OFFER: Flat 20% Off This Week!") {
    hero { title }
    lastUpdated
  }
}\n`);