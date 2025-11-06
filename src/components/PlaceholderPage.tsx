import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  backPath?: string;
  backLabel?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  backPath,
  backLabel = "Go Back"
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Construction className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-lg">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This feature is part of the flexible recruitment flow enhancement and will be implemented in upcoming tasks.
            </p>
            {backPath && (
              <Button 
                onClick={() => navigate(backPath)}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;