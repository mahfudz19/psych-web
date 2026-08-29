import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useGoogleLoginMutation } from "../../-api/auth.query";
import toast from "../../../../components/ui/Toast";

function ButtonLoginGoogle() {
  const googleRegisterMutation = useGoogleLoginMutation();

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Token Google tidak ditemukan.");
      return;
    }

    googleRegisterMutation.mutate({ token: credentialResponse.credential });
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error("Proses autentikasi Google digagalkan.")}
        shape="pill"
      />
    </div>
  );
}

export default ButtonLoginGoogle;
