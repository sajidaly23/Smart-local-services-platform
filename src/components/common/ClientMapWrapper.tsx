
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapMarker } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      Loading regional service map...
    </div>
  ),
});

interface ClientMapWrapperProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const ClientMapWrapper: React.FC<ClientMapWrapperProps> = (props) => {
  return <LeafletMap {...props} />;
};

export default ClientMapWrapper;

