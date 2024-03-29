import { useContext, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import {
  AuthContextType,
  Business,
  FormContextType,
  Review,
} from "./lib/frontendTypes";
import { AuthContext, FormContext } from "./components/contexts";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";

export const CreateReview: React.FC<{
  businesses: Business[];
  setBusinessesReviews: () => void;
  setMembersReviews: () => void;
}> = ({ businesses, setBusinessesReviews, setMembersReviews }) => {
  const contextValues = useContext(FormContext);
  const authContext = useContext(AuthContext);
  if (!contextValues || !authContext) return null;

  const { reviews, createReviewFn, formError, updateReviewFn } =
    contextValues as FormContextType;
  const { auth } = authContext as AuthContextType;

  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [business_id, setBusiness_id] = useState("");

  const navigate = useNavigate();

  if (!auth) {
    return (
      <>
        <h2>
          Create a Review:
          {formError &&
            !formError.message.toLowerCase().startsWith("login") &&
            !formError.message.toLowerCase().startsWith("registration") && (
              <span className="bg-error text-error-content text-xl ml-2 rounded-btn p-2">
                Error: {formError.message}
              </span>
            )}
        </h2>
        <div>
          {!auth && (
            <>
              <Dialog>
                <DialogTrigger className="w-full">
                  <Button className="py-4 px-6 mt-4 text-2xl bg-yellow-300">
                    <TriangleAlert />
                    Please Login or Register to Create a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-fit flex flex-col items-center justify-center">
                  <AuthForm />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </>
    );
  }

  setBusinessesReviews();
  setMembersReviews();

  const editableBusinesses = businesses.filter((business) => {
    return business.reviews.some((review) => review.member_id === auth.id);
  });

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (
      auth &&
      business_id ===
        editableBusinesses.find((business) => business.id === business_id)?.id
    ) {
      const tempReviewId = reviews.find(
        (review) => review.business_id === business_id
      )?.id;
      updateReviewFn({
        id: tempReviewId,
        rating,
        comment,
        business_id,
      } as Review);
      navigate(`/businesses/${business_id}`);
    } else if (auth) {
      createReviewFn({ rating, comment, business_id } as Review);
      navigate(`/businesses/${business_id}`);
    }
  };

  return (
    <>
      <h2>
        {editableBusinesses.find((business) => business.id === business_id)
          ? "Edit your Review:"
          : "Create your Review:"}
        {formError &&
          !formError.message.toLowerCase().startsWith("login") &&
          !formError.message.toLowerCase().startsWith("registration") && (
            <span className="bg-error text-error-content text-xl ml-2 rounded-btn p-2">
              Error: {formError.message}
            </span>
          )}
      </h2>
      {auth && (
        <Card>
          <CardHeader>
            <p>
              Note: You cannot submit a review for a business you have already
              reviewed
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select
              onValueChange={(value) => {
                navigate(value ? `/createreviews/${value}` : "/createreviews");
                setBusiness_id(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={"Select a Business"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {businesses.map((business) => {
                    return (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}{" "}
                        {editableBusinesses.find((b) => b.id === business.id)
                          ? "(editable)"
                          : ""}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <CardDescription>Rating: {rating}</CardDescription>
            <Slider
              className="w-1/4"
              min={1}
              max={5}
              step={1}
              defaultValue={[1]}
              onValueChange={(value) => setRating(value[0])}
            />
            <Textarea
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment here..."
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit}>Submit</Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};
