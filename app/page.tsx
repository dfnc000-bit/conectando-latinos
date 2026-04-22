import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/how-it-works'
import { Categories } from '@/components/categories'
import { FeaturedProviders } from '@/components/featured-providers'
import { ChatWidget } from '@/components/chat-widget'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Categories linkMode />
      <FeaturedProviders />
      <Footer />
      <ChatWidget />
    </main>
  )
}
