import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Globe, Mail, Phone, MapPin, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Configuration = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    contact_number: "",
    email_address: "",
    about_company: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    social_media: {
      twitter_link: "",
      instagram_link: "",
      facebook_link: "",
      linkedin_link: "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('social_media.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email_address) {
      toast({
        title: "Required fields missing",
        description: "Please fill in company name and email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saving configuration",
      description: "Updating company information...",
    });

    try {
      // TODO: Replace with your actual API endpoint for saving company configuration
      const response = await fetch('YOUR_API_ENDPOINT_FOR_CONFIGURATION', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers (authorization, etc.)
          // 'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Configuration save failed');
      }

      const result = await response.json();

      toast({
        title: "Configuration saved",
        description: "Company information has been updated successfully.",
      });

      // Store the configuration data locally if needed
      localStorage.setItem('companyConfig', JSON.stringify({
        ...formData,
        apiData: result,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving the configuration. Please try again.",
        variant: "destructive",
      });

      // Fallback: Store data locally for demo purposes
      localStorage.setItem('companyConfig', JSON.stringify({
        ...formData,
        timestamp: Date.now()
      }));
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Company Configuration</h1>
          <p className="text-lg text-muted-foreground">
            Manage your company information and settings
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Company Information</span>
            </CardTitle>
            <CardDescription>
              Enter your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter company name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-base">Company Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="website_url"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_number" className="text-base">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact_number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_address" className="text-base">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email_address"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email_address}
                    onChange={(e) => handleInputChange('email_address', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-base flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Street Address</span>
                </Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base">City</Label>
                  <Input
                    id="city"
                    placeholder="City name"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-base">State</Label>
                  <Input
                    id="state"
                    placeholder="State/Province"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country name"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-base">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="123456"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_link" className="text-base">Twitter Link</Label>
                  <Input
                    id="twitter_link"
                    type="url"
                    placeholder="https://twitter.com/yourcompany"
                    value={formData.social_media.twitter_link}
                    onChange={(e) => handleInputChange('social_media.twitter_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_link" className="text-base">Instagram Link</Label>
                  <Input
                    id="instagram_link"
                    type="url"
                    placeholder="https://instagram.com/yourcompany"
                    value={formData.social_media.instagram_link}
                    onChange={(e) => handleInputChange('social_media.instagram_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook_link" className="text-base">Facebook Link</Label>
                  <Input
                    id="facebook_link"
                    type="url"
                    placeholder="https://facebook.com/yourcompany"
                    value={formData.social_media.facebook_link}
                    onChange={(e) => handleInputChange('social_media.facebook_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_link" className="text-base">LinkedIn Link</Label>
                  <Input
                    id="linkedin_link"
                    type="url"
                    placeholder="https://linkedin.com/company/yourcompany"
                    value={formData.social_media.linkedin_link}
                    onChange={(e) => handleInputChange('social_media.linkedin_link', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* About Company */}
            <div className="space-y-2">
              <Label htmlFor="about_company" className="text-base">About Company</Label>
              <Textarea
                id="about_company"
                placeholder="Tell us about your company, its mission, values, and culture..."
                value={formData.about_company}
                onChange={(e) => handleInputChange('about_company', e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide a brief description of your company that will be used in communications and reports.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Configuration;
