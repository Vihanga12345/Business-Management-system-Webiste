
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Newsletter section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-cyan-500 mb-4">KNOW IT ALL FIRST!</h3>
            <p className="text-gray-300 mb-8 text-lg">Never Miss Anything From Geolex By Signing Up To Our Newsletter.</p>
            <div className="flex max-w-md mx-auto gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-6 py-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-r-lg transition-colors font-semibold">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">GEOLEX</h3>
                <p className="text-sm text-gray-400">YOUR TRUSTED PC PARTNER</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Inspired by truly loved customers and established in 2005 as Geolex. 
              Well known in PC industry all over Sri Lanka with The best PCs and Accessories.
            </p>
          </div>

          {/* Head Office */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-cyan-500">HEAD OFFICE</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <p>No.50, New Road,</p>
                  <p>Ambalangoda, Sri Lanka.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">📞</span>
                <p>Call Us: +94 912 255 942</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">✉️</span>
                <p>Email: info@geolex.lk</p>
              </div>
            </div>
          </div>

          {/* Galle Branch */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-cyan-500">GALLE BRANCH</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <p>No.207C, Wakwella Road,</p>
                  <p>Galle, Sri Lanka.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">📞</span>
                <p>Call Us: +94 912 246 200</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">✉️</span>
                <p>Email: info@geolex.lk</p>
              </div>
            </div>
          </div>

          {/* Matara Branch */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-cyan-500">MATARA BRANCH</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <p>No.61A, Anagarika Dharmapala Mawatha,</p>
                  <p>Matara, Sri Lanka.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">📞</span>
                <p>Call Us: +94 412 050 800</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">✉️</span>
                <p>Email: info@geolex.lk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2021 - 2025 Geolex powered by CeyNet</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
