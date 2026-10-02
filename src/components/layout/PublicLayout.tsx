import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFab from './WhatsAppFab';
import OrganizationSchema from '../OrganizationSchema';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationSchema />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
