import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { gpus } from "@/utils/api";
import clsx from "clsx";
export interface Gpus {
  availability: { total: number; available: number };
  models: Array<{
    vendor: string;
    model: string;
    ram: string;
    interface: string;
    availability: { total: number; available: number };
    providerAvailability: { total: number; available: number };
    price: { min: number; max: number; avg: number; med: number };
  }>;
}

const GpuTable = ({
  initialData,
  subCom,
}: {
  initialData?: any;
  subCom?: boolean;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table
        initialData={{
          data: initialData,
        }}
        subCom={subCom}
      />
    </QueryClientProvider>
  );
};

export default GpuTable;

const Table = ({
  initialData,
  subCom,
}: {
  initialData?: {
    data: any;
  };
  subCom?: boolean;
}) => {
  const {
    data: { data },
  } = useQuery<
    {
      data: Gpus;
    },
    Error
  >({
    queryKey: ["GPU_TABLE"],
    queryFn: () => axios.get(gpus),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    initialData: initialData || {
      data: {
        availability: { total: 0, available: 0 },
        models: [],
      },
    },
  });
  console.log(data);

  return <Tables data={data} subCom={subCom} />;
};

const modifyModel = (model: string) => {
  return model === "rtxa6000"
    ? "A6000"
    : model?.includes("rtx")
    ? model?.replace("rtx", "RTX ").replace("ti", " Ti")
    : model;
};

export const price = (price: number) => {
  return price?.toFixed(2) ?? "0.00";
};

export const Tables = ({ data, subCom }: { data: Gpus; subCom?: boolean }) => {
  return (
    <section
      className={clsx(
        " mx-auto flex max-w-[1080px]  flex-col gap-8 ",
        subCom ? "" : "container pt-[80px]",
      )}
    >
      <div
        className={clsx(
          "flex flex-col justify-between gap-4 ",
          subCom
            ? "lg:flex-row lg:items-center lg:border-b lg:pb-3"
            : "md:flex-row md:items-center md:border-b md:pb-3",
        )}
      >
        <h1
          className={clsx(
            "border-b pb-3 text-base font-medium ",
            subCom
              ? "md:text-xl lg:border-b-0 lg:pb-0"
              : "md:border-b-0 md:pb-0 md:text-xl",
          )}
        >
          GPU availability and pricing
        </h1>
        <div className="ml-auto flex items-center gap-2 ">
          <h2 className="text-sm font-medium text-iconText">
            Total Available GPUs
          </h2>
          <div className="rounded-md border p-2 shadow-sm ">
            <span className="text-base font-bold">
              {data?.availability?.available || 0}
            </span>

            <span className="ml-2  text-sm text-iconText">
              (of {data?.availability?.total || 0})
            </span>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-4 ",
          subCom ? "lg:hidden" : "md:hidden",
        )}
      >
        {/* //most availability at top */}
        {data?.models
          ?.sort((a, b) => b.availability.available - a.availability.available)
          ?.map((model, index) => (
            <div
              key={index}
              className="flex flex-col gap-5  rounded-xl border bg-background2  p-3 shadow-sm"
            >
              <div className="flex  items-center gap-3 p-2 ">
                <img src="/logos/nvidia.png" alt="nvidia" className="h-6 " />
                <h1 className="text-2xl font-semibold capitalize">
                  {modifyModel(model?.model)}
                </h1>
              </div>
              <div className="h-px w-full bg-border"></div>
              <div className=" flex  flex-col gap-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-iconText">vRAM:</p>
                  <p className="text-xs font-semibold">{model?.ram}</p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-iconText">
                    Interface:
                  </p>
                  <p className="text-xs font-semibold">{model?.interface}</p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-iconText">
                    Availability:
                  </p>
                  <p className="">
                    <span className="text-sm  font-semibold text-foreground">
                      {model?.availability?.available}
                    </span>
                    <span className="pl-2 text-xs text-iconText">
                      (of {model?.availability?.total})
                    </span>
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-border"></div>
              <CustomHoverCard model={model} />
            </div>
          ))}
      </div>

      <div
        className={clsx(
          "hidden overflow-x-auto ",
          subCom ? "lg:block" : "md:block",
        )}
      >
        <table
          className={clsx(
            "w-full  border-separate border-spacing-y-1 ",
            subCom ? "" : "",
          )}
          cellSpacing={0}
        >
          <thead>
            <tr>
              <th className="px-2 text-left   text-sm font-medium  tracking-normal">
                Chipset
              </th>
              <th className="px-2 text-left  text-sm font-medium tracking-normal">
                vRAM
              </th>
              <th className="px-2 text-left text-sm font-medium tracking-normal">
                Interface
              </th>
              <th className="px-2 text-left  text-sm font-medium tracking-normal">
                Availability
              </th>
              <th className="pr-2 text-left  text-sm font-medium tracking-normal ">
                Price (USD/hr)
              </th>
            </tr>
          </thead>
          <tbody className="mt-1 ">
            {data?.models
              ?.sort(
                (a, b) => b.availability.available - a.availability.available,
              )
              ?.map((model, index) => (
                <tr
                  key={index}
                  className=" overflow-hidden rounded-lg  bg-background2 shadow-sm"
                >
                  <td
                    className={clsx(
                      " rounded-l-lg  border-y border-l px-2 py-2 text-base font-semibold  xl:px-4  xl:text-lg",
                      subCom
                        ? "w-[30%] lg:w-[27%] xl:w-[35%] 2xl:w-[40%] "
                        : "w-[30%] lg:w-[40%]",
                    )}
                  >
                    <div className="flex items-center gap-3 capitalize">
                      <img
                        src="/logos/nvidia.png"
                        alt="nvidia"
                        className="h-5 "
                      />
                      {modifyModel(model?.model)}
                    </div>
                  </td>

                  <td className=" w-[13%]  border-y px-2 py-2 text-left text-sm font-medium text-para">
                    {model?.ram}
                  </td>
                  <td className=" w-[13%] border-y px-2 py-2 text-left  text-sm font-medium text-para">
                    {model?.interface}
                  </td>
                  <td className="w-[13%]  border-y px-2 py-2 text-left">
                    <span className="text-sm  font-semibold text-foreground">
                      {model?.availability?.available}
                    </span>
                    <span className="pl-2 text-xs text-iconText">
                      (of {model?.availability?.total})
                    </span>
                  </td>

                  <td className="  rounded-r-lg border-y border-r   pr-2 ">
                    <CustomHoverCard model={model} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="font-para text-xs">
        *Disclaimer: The pricing displayed is determined by a dynamic bidding
        engine, where providers compete to offer their compute resources. These
        prices offer transparency and insight into the spectrum of pricing
        options available within the Akash marketplace. Please be aware that the
        prices displayed are subject to change based on real-time market
        conditions and individual provider offerings. As such, users are
        encouraged to review all available pricing information carefully and
        consider their specific requirements before making any decisions or
        commitments.
      </p>
    </section>
  );
};

const CustomHoverCard = ({ model }: { model: Gpus["models"][0] }) => {
  return (
    <div className="flex flex-col items-start gap-1 ">
      <div className="rounded-x-md relative min-w-[170px]  rounded-b-md border-x border-b px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        {/* <div className="absolute inset-0 bg-gradient-to-b from-white to-white/20 dark:from-background2 dark:to-background2/20"></div> */}
        Min: ${price(model?.price?.min)}
      </div>
      <div className="flex w-full items-center justify-center gap-2.5 rounded-md bg-black px-2 py-1 dark:bg-[#EDEDED] ">
        <div className="flex items-center gap-1">
          <HoverCard openDelay={2} closeDelay={2}>
            <HoverCardTrigger className="flex cursor-pointer items-center gap-1">
              <p className="">
                <span className="text-base text-para dark:text-iconText md:text-xs">
                  Mid:
                </span>
                <span className="pl-1 text-base font-bold text-white dark:text-black  md:text-xs">
                  ${price(model?.price?.med)}
                </span>
              </p>
              <Info size={12} className="text-para" />
            </HoverCardTrigger>
            <HoverCardContent align="center">
              <div className="flex flex-col">
                <div className="flex flex-col px-4 py-3">
                  <h1 className="text-sm font-medium ">
                    {model?.providerAvailability?.available || 0} providers
                    offering this <br /> model
                  </h1>
                  <div className="mt-4  flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-sm text-iconText">Max:</h1>
                      <div className="text-base font-bold ">
                        ${price(model?.price?.max)}/hr
                      </div>
                    </div>
                    <div className="h-8 w-px border-r "></div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-sm text-iconText">Min:</h1>
                      <div className="text-base font-bold ">
                        ${price(model?.price?.min)}/hr
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t bg-badgeColor px-4 py-3">
                  <p className="text-base  text-para">Mid:</p>
                  <div className="text-base font-bold  ">
                    ${price(model?.price?.med)}/hr
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="h-4 w-px  bg-para"></div>
        <a
          href="https://console.akash.network/rent-gpu"
          target="_blank"
          className="text-base font-medium text-white dark:text-black md:text-xs"
        >
          Rent Now
        </a>
      </div>
      <div className=" rounded-x-md relative min-w-[170px]  rounded-t-md border-x border-t px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        Max: ${price(model?.price?.max)}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-white to-white/20 dark:from-background2 dark:to-background2/20"></div> */}
      </div>
    </div>
  );
};
