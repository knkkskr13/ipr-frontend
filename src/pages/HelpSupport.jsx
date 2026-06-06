import Layout from '../components/Layout';

const FAQItem = ({ q, a }) => (
  <div className="border-b border-gray-100 pb-4">
    <p className="text-sm font-semibold text-gray-800 mb-1">{q}</p>
    <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
  </div>
);

export default function HelpSupport() {
  return (
    <Layout title="Help & Support">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Help &amp; Support</h2>
        <p className="text-sm text-gray-500 mt-1">Guidance for filing your Immovable Property Return</p>
      </div>

      {/* Contact */}
      <div className="card p-5 mb-5 border-l-4 border-primary-600">
        <h3 className="section-title">Contact Support</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['Department', 'National Informatics Centre', '🏢'],
            ['Unit', 'Tripura State Unit', '📍'],
            ['Email', 'support@nic.tripura.gov.in', '📧'],
          ].map(([label, value, icon]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{icon} {value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to file */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">How to File Your IPR Return</h3>
        <ol className="space-y-3">
          {[
            ['Step 1 — Go to IPR Filing', 'Click on "IPR Filing" in the left sidebar under IPR / Property section.'],
            ['Step 2 — Fill Employee Details', 'Your details are auto-filled. Enter the Reporting Year, As On Date, and Total Annual Income.'],
            ['Step 3 — Add Properties', 'Click "Add Property" to add each immovable property you own or hold. Fill all required fields.'],
            ['Step 4 — Declaration', 'Check the declaration checkbox, enter the date and place of signing.'],
            ['Step 5 — Save or Submit', 'Use "Save as Draft" to save progress. Click "Submit" to submit for Admin approval.'],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="card p-5">
        <h3 className="section-title">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <FAQItem
            q="What is an Immovable Property Return (IPR)?"
            a="An IPR is a mandatory annual declaration by government servants of all immovable properties owned or held by them, under Rule-18 of the Tripura Civil Services (Conduct) Rules, 1988."
          />
          <FAQItem
            q="When should I file my IPR?"
            a="The IPR must be filed annually. The 'As On Date' is typically 31st December of the reporting year."
          />
          <FAQItem
            q="What if I have no immovable property?"
            a="You still need to file a NIL return. Simply submit the form without adding any properties."
          />
          <FAQItem
            q="Can I edit after submitting?"
            a="No. Once submitted, the return cannot be edited. Contact your Admin if corrections are needed."
          />
          <FAQItem
            q="What does RETURNED status mean?"
            a="The Admin has sent back your return for corrections. Contact your department Admin for details."
          />
          <FAQItem
            q="Who approves my IPR return?"
            a="The designated Admin of the IPR Management System reviews and approves submitted returns."
          />
        </div>
      </div>
    </Layout>
  );
}
