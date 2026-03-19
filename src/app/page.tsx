import Navbar from '@/components/Navbar'
import HeroPrompt from '@/components/HeroPrompt'
import BottomCTA from '@/components/landing/BottomCTA'
import Footer from '@/components/Footer'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-vibe-bg-primary overflow-x-hidden">
            <Navbar />
            <div className="pt-20">
                <HeroPrompt />
            </div>
            <BottomCTA />
            <Footer />
        </main>
    )
}
