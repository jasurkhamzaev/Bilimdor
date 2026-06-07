import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from '@phosphor-icons/react';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primaryPurple text-white py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star weight="fill" size={20} className="text-white" />
              </div>
              <span className="font-heading font-black text-lg">
                {t('appName')}
              </span>
            </div>
            <p className="font-body text-white/80">
              {t('greeting')}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4">Orollar</h4>
            <ul className="space-y-2 font-body">
              <li><a href="#" className="hover:text-primaryPink transition-colors">Quvonch Oroli</a></li>
              <li><a href="#" className="hover:text-primaryPink transition-colors">Kashfiyot Oroli</a></li>
              <li><a href="#" className="hover:text-primaryPink transition-colors">Kelajak Oroli</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4">Bog'lanish</h4>
            <ul className="space-y-2 font-body">
              <li><a href="#" className="hover:text-primaryPink transition-colors">Email: info@hashimjon.uz</a></li>
              <li><a href="#" className="hover:text-primaryPink transition-colors">Tel: +998 90 123 45 67</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4">Ijtimoiy tarmoqlar</h4>
            <ul className="space-y-2 font-body">
              <li><a href="#" className="hover:text-primaryPink transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-primaryPink transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-primaryPink transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center font-body text-white/60">
          <p>© 2025 Hashimjon Akademiyasi. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;