import { CRISIS_RESOURCES } from 'shared/constants';
import { Button } from '@components/ui/button';

interface CrisisBannerProps {
  onContinue: () => void;
  onExit: () => void;
}

function CrisisBanner({ onContinue, onExit }: CrisisBannerProps) {
  return (
    <div
      role="alert"
      className="border-2 border-amber-400 bg-amber-50 rounded-lg p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" aria-hidden="true">&#9888;&#65039;</span>
        <h2 className="text-lg font-medium text-amber-800">
          If you&apos;re in crisis, please reach out for support
        </h2>
      </div>

      <p className="text-amber-800 mb-6">
        You deserve support from people who are trained to help. These resources
        are available 24/7, free, and confidential.
      </p>

      <ul className="space-y-3 mb-6">
        {CRISIS_RESOURCES.map((resource) => (
          <li
            key={resource.name}
            className="bg-white border-l-4 border-amber-400 p-4 rounded-r-md"
          >
            <div className="font-medium text-amber-800">{resource.name}</div>
            <div className="text-amber-800 font-medium text-lg">
              {resource.contact}
            </div>
            <div className="text-amber-700 text-sm">{resource.details}</div>
          </li>
        ))}
      </ul>

      <div className="bg-white p-4 rounded-md text-amber-800 text-sm mb-6">
        <strong>Important:</strong> Sift is a reflection tool, not crisis
        support or therapy. If you&apos;re experiencing a crisis, please use the
        resources above to connect with trained professionals who can help.
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="secondary" onClick={onExit}>
          Exit to Dashboard
        </Button>
        <Button variant="outline" onClick={onContinue}>
          Continue with Entry
        </Button>
      </div>
    </div>
  );
}

export { CrisisBanner };
