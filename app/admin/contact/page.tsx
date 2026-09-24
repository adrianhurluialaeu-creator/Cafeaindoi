import AdminShell from "../../../components/AdminShell";
import AdminContact from "../../../components/AdminContact";
export const metadata={title:"Contact · Admin",robots:{index:false,follow:false}};
export default function Page(){return <AdminShell title="Contact" subtitle="Mesaje, răspunsuri și datele publice de contact."><AdminContact/></AdminShell>}
