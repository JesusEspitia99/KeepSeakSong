import { useState } from 'react'
import Hero from './components/Hero'
import ProblemMechanism from './components/ProblemMechanism'
import HowItWorks from './components/HowItWorks'
import FeaturedSongs from './components/FeaturedSongs'
import CustomerTestimonials from './components/CustomerTestimonials'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import ProgressBar from './components/ProgressBar'
import Step1Recipient from './components/steps/Step1Recipient'
import Step2Style from './components/steps/Step2Style'
import Step3Special from './components/steps/Step3Special'
import Step4Memories from './components/steps/Step4Memories'
import Step5Heart from './components/steps/Step5Heart'
import PreCheckout from './components/PreCheckout'
import UrgencyBanner from './components/UrgencyBanner'
import StickyCTA from './components/StickyCTA'
import ExitIntentOffer from './components/ExitIntentOffer'
import Footer from './components/Footer'
import Terms from './components/legal/Terms'
import Privacy from './components/legal/Privacy'
import { trackEvent } from './lib/pixel'

const TOTAL_STEPS = 5

const INITIAL_DATA = {
  recipient: '',
  name: '',
  pronunciation: '',
  nickname: '',
  vibe: '',
  genre: '',
  voice: '',
  special: '',
  memories: '',
  heartMessage: '',
  email: '',
}

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  if (path === '/terms') return <Terms />
  if (path === '/privacy') return <Privacy />

  return <Quiz />
}

function Quiz() {
  const [stage, setStage] = useState('hero') // hero | 1-5 | precheckout
  const [data, setData] = useState(INITIAL_DATA)

  function update(patch) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function goToStep(step) {
    setStage(step)
    trackEvent('ViewContent', { content_name: `quiz_step_${step}` })
  }

  function startQuiz() {
    goToStep(1)
  }

  const stepProps = { data, update }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 via-white to-white">
      <UrgencyBanner />
      {stage === 'hero' && (
        <>
          <Hero onStart={startQuiz} />
          <ProblemMechanism />
          <HowItWorks />
          <FeaturedSongs />
          <CustomerTestimonials />
          <FAQ />
          <FinalCTA onStart={startQuiz} />
          <StickyCTA onStart={startQuiz} />
          <ExitIntentOffer onStart={startQuiz} />
        </>
      )}

      {typeof stage === 'number' && (
        <div className="px-6 py-10">
          <ProgressBar
            step={stage}
            total={TOTAL_STEPS}
            onBack={() => goToStep(stage === 1 ? 'hero' : stage - 1)}
          />

          {stage === 1 && <Step1Recipient {...stepProps} onNext={() => goToStep(2)} />}
          {stage === 2 && <Step2Style {...stepProps} onNext={() => goToStep(3)} />}
          {stage === 3 && <Step3Special {...stepProps} onNext={() => goToStep(4)} />}
          {stage === 4 && <Step4Memories {...stepProps} onNext={() => goToStep(5)} />}
          {stage === 5 && <Step5Heart {...stepProps} onNext={() => goToStep('precheckout')} />}
        </div>
      )}

      {stage === 'precheckout' && <PreCheckout data={data} />}

      {stage === 'hero' && <Footer />}
    </div>
  )
}
