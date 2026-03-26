import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

// answers may be a string or a JSX element
const FAQS = [
  {
    q: 'What is this for?',
    a: "I'm glad you asked! This allows quest team members to enter their typical weekly availability so that everyone knows when it's a good time to send out quest invites. Because if you send out invites right after one of your teammates goes to sleep, after a few hours Tonic might open the quest to randoms, and your teammate might wake up with the quest already full and started!!!",
  },
  {
    q: 'How does it work?',
    a: 'I\'m glad you asked! You, as the "team organizer" will create a team. Then you can add yourself as a member and put in your availability. Then, you give the link or the team ID to the other members of your team and they\'ll put their availability in (or you can do it for them). Next time you need to send invites for a quest, just check the team page and it will tell you the next time that is good to send invites (to avoid randoms)!',
  },
  {
    q: "Can't we just ask everyone if they're available?",
    a: "I'm glad you asked! That may work for your team, but what if you're spread across different time zones and someone is asleep? This helps you keep track, so you can send out invites within a few hours of when they'll wake up. You don't want randoms slipping in.",
  },
  {
    q: 'What is this "Time reserved for invites" value? Shouldn\'t that be 1 hour?',
    a: "I'm glad you asked! Technically, Tonic sets a 1 hour reserved time for invites, but in reality the time is longer than that.",
  },
  {
    q: "Why do you have it set for 5 hours? That's wrong!",
    a: "I'm glad you asked! Five hours seems like a reasonable amount of time to me, based on what I've seen. If you want to lengthen or shorten it, you have that option!",
  },
  {
    q: 'My team never has a problem with randoms joining.',
    a: "I'm glad you asked! You're lucky, and that isn't a question!",
  },
  {
    q: 'Can this make it easy to figure out when my entire team is available at the same time so everyone can join the quest at the same time?',
    a: 'I\'m glad you asked! That kind of scheduling tool already exists elsewhere, so this isn\'t optimized for that. But you can give it a try if you set the "Time reserved for invites" value to 0.',
  },
  {
    q: 'Will you make X modification for me?',
    a: <>I'm glad you asked! Maybe! <Link to="/coming-features" className="text-blue-600 hover:underline">I have a few modifications planned already</Link>, but I don't know how much more time I want to spend on this.</>,
  },
  {
    q: 'Why are you only letting a few people use this?',
    a: "I'm glad you asked! I'm using the free tier of Supabase and Vercel, and I don't want so many users that I have to pay for it. Plus, we are just testing this for now.",
  },
  {
    q: "You say this is in test. What if I want you to keep my team's schedule?",
    a: "I'm glad you asked! If you tell me your team ID, I will add it to my list of teams to not delete when I clean up the data. But if there's a crash or some data problem, everyone will need to re-enter the data.",
  },
  {
    q: "If there's a crash, can't you use a backup to restore things?",
    a: "I'm glad you asked! No, I don't have backups on the free tier. If this gets enough traction, maybe I'll get a subscription.",
  },
  {
    q: 'Why are you working on this instead of practicing?',
    a: "I'm glad you asked! I know, you're right! And I'm spending valuable hours of time doing this when I could be gaining xp for the challenge! I'm crazy!!!",
  },
  {
    q: 'Will you sing Yellow for me?',
    a: "I'm glad you asked! No!",
  },
]

export default function Faq() {
  return (
    <div>
      <NavBar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Questies Assemble!</h1>
        <p className="text-gray-600 mb-8">Organize your quest team invites!</p>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
        <ul className="space-y-6">
          {FAQS.map(({ q, a }) => (
            <li key={q}>
              <p className="text-sm font-semibold text-gray-900 mb-1">Q: {q}</p>
              <p className="text-sm text-gray-600">A: {a}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
