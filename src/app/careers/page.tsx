import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Users, Heart, Lightbulb, ArrowRight, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-indigo-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Join Our Mission to Transform Dutch Payroll</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              We're building the future of payroll technology in the Netherlands. Join our passionate team and help businesses across the country streamline their operations.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Work at SalarySync?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Collaborative Culture</h3>
                <p className="text-gray-600">Work with a diverse, talented team that values collaboration, innovation, and mutual respect.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Heart className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Work-Life Balance</h3>
                <p className="text-gray-600">Enjoy flexible working arrangements, generous vacation time, and a supportive environment that prioritizes your well-being.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Lightbulb className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Growth Opportunities</h3>
                <p className="text-gray-600">Advance your career with continuous learning opportunities, mentorship programs, and challenging projects.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Senior Full-Stack Developer</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Amsterdam, Netherlands</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Full-time</span>
                    </div>
                  </div>
                  <Link href="#" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Apply Now
                  </Link>
                </div>
                <p className="text-gray-600">Join our engineering team to build scalable payroll solutions using React, Node.js, and modern cloud technologies.</p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Product Manager</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Amsterdam, Netherlands</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Full-time</span>
                    </div>
                  </div>
                  <Link href="#" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Apply Now
                  </Link>
                </div>
                <p className="text-gray-600">Lead product strategy and development for our payroll platform, working closely with engineering and design teams.</p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Customer Success Manager</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Amsterdam, Netherlands</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Full-time</span>
                    </div>
                  </div>
                  <Link href="#" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Apply Now
                  </Link>
                </div>
                <p className="text-gray-600">Help our customers succeed by providing exceptional support and guidance throughout their payroll journey.</p>
              </div>
            </div>
          </section>

          <section className="text-center bg-indigo-50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">Don't See the Right Role?</h2>
            <p className="text-lg text-indigo-700 mb-8">We're always looking for talented individuals to join our team. Send us your resume and let us know how you'd like to contribute.</p>
            <a href="/contact" className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center">
              Get in Touch <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}

