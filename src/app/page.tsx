import Navbar from '@/components/Navbar'
import HeroPrompt from '@/components/HeroPrompt'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import BottomCTA from '@/components/landing/BottomCTA'
import Footer from '@/components/Footer'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-vibe-bg-primary overflow-x-hidden">
            <Navbar />
            <div className="pt-20">
                <HeroPrompt />
            </div>
            <Features />
            <Pricing />
            <BottomCTA />
            <Footer />
        </main>
    )
}
