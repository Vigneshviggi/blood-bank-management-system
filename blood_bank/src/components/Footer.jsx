import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-t border-purple-700">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-4 lg:gap-8">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">About</h3>
          <p className="mt-4 text-sm leading-6 text-white/70">
            This platform connects donors, hospitals, and receivers to ensure timely blood availability.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>Phone: +1 (555) 987-6543</p>
            <p>Email: support@lifelink.org</p>
            <p>Address: 123 LifeLink Hospital Rd, Downtown City</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-red-400">Help</h3>
          <ul className="mt-4 space-y-3 text-sm text-red-200">
            <li><Link to="/contact" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">FAQs</Link></li>
            <li><Link to="/contact" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">How it works</Link></li>
            <li><Link to="/contact" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-red-400">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-red-200">
            <li><Link to="/" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">Dashboard</Link></li>
            <li><Link to="/donors" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">Donors</Link></li>
            <li><Link to="/camps" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">Camps</Link></li>
            <li><Link to="/requests" className="transition-all duration-200 ease-in-out hover:text-white hover:scale-105 inline-block">Requests</Link></li>
          </ul>
        </div>
      </div>
      <div className="bg-red-900 px-6 py-4 text-center text-xs text-red-300 sm:px-8 border-t border-red-800">
        © 2026 LifeLink. All rights reserved.
      </div>
    </footer>
  )
}
