import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Icon name="Building2" size={32} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Nalar</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/settings/billing" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <a href="http://localhost:8000/api/docs/" target="_blank" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                API Docs
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="gap-2">
                  Get Started
                  <Icon name="ArrowRight" size={12} />
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Icon name="Menu" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <Icon name="GraduationCap" size={16} />
              ERP for Research Organizations & NGOs
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Empowering NGOs to
              <span className="text-blue-600 dark:text-blue-400"> Manage Impact</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              A comprehensive ERP platform designed specifically for research organizations and NGOs.
              Streamline research management, donor relations, grant tracking, and dissemination activities—all in one place.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <Icon name="ArrowRight" size={16} />
                </Button>
              </Link>
              <Link href="/settings/billing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-500" />
                14-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything your organization needs
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Purpose-built modules for research and development organizations
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Research Management */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Icon name="FlaskConical" size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Research Management
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Track research projects, milestones, publications, and deliverables. Monitor progress and collaborate with research teams effectively.
                </p>
              </div>

              {/* Grant & Donor Management */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Icon name="DollarSign" size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Grant & Donor Management
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage grants, track disbursements, maintain donor relationships, and ensure compliance with funding requirements.
                </p>
              </div>

              {/* Dissemination & Publications */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Icon name="Megaphone" size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Dissemination & Publications
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Share research findings, manage publications, organize seminars, and track knowledge dissemination activities.
                </p>
              </div>

              {/* Team & HR Management */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Icon name="Users" size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Team & HR Management
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage researchers, staff, volunteers, payroll, attendance, and performance tracking in one integrated system.
                </p>
              </div>

              {/* Financial Management */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Icon name="Receipt" size={24} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Financial Management
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Budget tracking, expense management, financial reporting, and audit-ready documentation for donors and stakeholders.
                </p>
              </div>

              {/* Document & Asset Management */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Icon name="FileText" size={24} className="text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Document & Asset Management
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Secure storage for research documents, contracts, reports, and equipment tracking with version control and access permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Nalar */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why research organizations choose Nalar?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Built specifically for NGOs and research institutions
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Icon name="Target" size={20} className="text-blue-600 dark:text-blue-400" />
                  Impact-Focused Design
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    Purpose-built for research organizations and NGOs. Track measurable outcomes, donor requirements, and project impact with ease.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Icon name="ShieldCheck" size={20} className="text-blue-600 dark:text-blue-400" />
                  Compliance & Transparency
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    Complete audit trails, donor reporting, grant compliance tracking, and transparent financial management to meet accountability standards.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Icon name="Globe" size={20} className="text-blue-600 dark:text-blue-400" />
                  Multi-Organization Support
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    Multi-tenant architecture allows managing multiple NGOs, research centers, or branch offices with complete data isolation and customization.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-blue-600 dark:bg-blue-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to amplify your impact?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join research organizations and NGOs using Nalar to streamline operations, manage donors, and maximize their research impact.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Free Trial
                  <Icon name="ArrowRight" size={16} />
                </Button>
              </Link>
              <Link href="http://localhost:8000/api/docs/" target="_blank">
                <Button size="lg" variant="ghost" className="text-white hover:text-white hover:bg-blue-700">
                  View API Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nalar ERP</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Empowering research organizations and NGOs to manage impact efficiently.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Product</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Dashboard</Link></li>
                <li><Link href="/settings/billing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Pricing</Link></li>
                <li><a href="http://localhost:8000/api/docs/" target="_blank" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Resources</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="http://localhost:8000/api/redoc/" target="_blank" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Documentation</a></li>
                <li><Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2025 Nalar ERP. Built for Research Organizations & NGOs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
