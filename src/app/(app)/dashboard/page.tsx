import { getMessages } from "@/actions/message";
import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/app/auth";
import { User } from "next-auth";
import CopyToClipboard from "@/components/CopyToClipboard";
import { redirect } from "next/navigation";

async function UserDashboard() {
  const session = await auth();
  const _user: User = session?.user;
  if (!_user) {
    redirect("/");
  }

  const response = await getMessages();
  const messages = response.messages;

  const BASE_URl = process.env.BASE_URL;

  const profileUrl = `${BASE_URl}/u/${_user.username}`;

  //   setValue("acceptMessages", _user.isAcceptingMessages);

  //   const form = useForm({
  //     resolver: zodResolver(AcceptMessageSchema),
  //   });

  //   const { register, watch, setValue } = form;
  //   const acceptMessages = watch("acceptMessages");

  //   const handleSwitchChange = async () => {
  //     setValue("acceptMessages", !acceptMessages);
  //   };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <CopyToClipboard profileUrl={profileUrl} />
        </div>
      </div>

      {/* <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div> */}
      <Separator />

      {/* <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button> */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages?.length! > 0 ? (
          messages?.map((message, index) => (
            <MessageCard key={message.id} message={message} />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
