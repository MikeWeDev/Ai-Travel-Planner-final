import React, { createContext, useContext, useState } from "react";

// Updated Type to handle precise budget tracking
type TravelForm = {
  country: string;
  city: string;
  departureDate: Date | null;
  returnDate: Date | null;
  tripType?: "solo" | "couple" | "family" | "group";
  interests?: string[];
  // CHANGED: Budget is now an object instead of an enum string
  budget?: {
    amount: number;
    category: string;
  };
  duration?: number;
};

type ItineraryDay = {
  day: number;
  activities: string[];
  imageUrl?: string;
};

type FormContextType = {
  step: number;
  setStep: (step: number) => void;

  itinerary: ItineraryDay[] | null;
  setItinerary: (data: ItineraryDay[] | null) => void;

  formData: TravelForm;
  setFormData: (data: Partial<TravelForm>) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);
  
  // Initial state updated to include the budget object structure
  const [formData, setFormDataState] = useState<TravelForm>({
    country: "",
    city: "",
    departureDate: null,
    returnDate: null,
    budget: { amount: 0, category: "Economy (<$1k)" } 
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);

  const setFormData = (data: Partial<TravelForm>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <FormContext.Provider
      value={{ step, setStep, formData, setFormData, itinerary, setItinerary }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("useFormContext must be used inside provider");
  return context;
};