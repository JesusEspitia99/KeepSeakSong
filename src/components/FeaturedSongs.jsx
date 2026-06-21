import AudioTestimonial from './AudioTestimonial'
import { TESTIMONIALS } from '../data/testimonials'

export default function FeaturedSongs() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="text-center text-2xl font-medium text-navy-900 md:text-3xl">
        Stories that already became a song
      </h2>
      <p className="mt-2 text-center text-navy-400">Real stories, turned into real songs</p>

      <div className="mt-8 space-y-4">
        {TESTIMONIALS.map((t) => (
          <AudioTestimonial key={t.title} title={t.title} name={t.name} src={t.src} story={t.story} />
        ))}
      </div>
    </section>
  )
}
