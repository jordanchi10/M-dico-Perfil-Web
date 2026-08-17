/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Stethoscope, 
  Heart, 
  HeartPulse, 
  Bone, 
  Smile, 
  Brain, 
  Eye, 
  Baby, 
  Activity, 
  Dna, 
  Syringe, 
  Pill, 
  Microscope, 
  Scissors, 
  Thermometer, 
  Sparkles, 
  ShieldCheck, 
  Cross, 
  FileText, 
  Award,
  LucideProps
} from "lucide-react";

interface MedicalIconProps extends LucideProps {
  name: string;
}

export const MedicalIconRenderer: React.FC<MedicalIconProps> = ({ name, ...props }) => {
  switch (name?.toLowerCase()) {
    case "stethoscope":
      return <Stethoscope {...props} />;
    case "heart":
      return <Heart {...props} />;
    case "heartpulse":
      return <HeartPulse {...props} />;
    case "bone":
      return <Bone {...props} />;
    case "smile":
      return <Smile {...props} />;
    case "brain":
      return <Brain {...props} />;
    case "eye":
      return <Eye {...props} />;
    case "baby":
      return <Baby {...props} />;
    case "activity":
      return <Activity {...props} />;
    case "dna":
      return <Dna {...props} />;
    case "syringe":
      return <Syringe {...props} />;
    case "pill":
      return <Pill {...props} />;
    case "microscope":
      return <Microscope {...props} />;
    case "scissors":
      return <Scissors {...props} />;
    case "thermometer":
      return <Thermometer {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "shieldcheck":
      return <ShieldCheck {...props} />;
    case "cross":
      return <Cross {...props} />;
    case "filetext":
      return <FileText {...props} />;
    case "award":
      return <Award {...props} />;
    default:
      return <Stethoscope {...props} />;
  }
};
