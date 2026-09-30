import React from "react";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErrors";
import "../styles/apiIntegration.css";


type ApiInfoResponse = {
  apiInfo: {
    id: number;
    name: string;
    apiKey: string;
    apiSecret: string;
    status: string;
    accountId: number;
    createdAt: string;
    updatedAt: string;
  };
};

export default function APIIntegration() {
    const [name, setName] = React.useState("");
    const [apiInfo, setApiInfo] = React.useState<ApiInfoResponse | null>(null);
    const [alert, setAlert] = React.useState({ msg: "", success: false, error: false });
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const client = ApiClient();

    function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { value } = e.currentTarget;

        setName(value);
        setErrors((prev) => ({ ...prev, name: "" }));
    }

    React.useEffect(() => {
        const getAPI = async () => {
            try {
                const { data } = await client.get("/auth/user-APIKey");
                setApiInfo(data);
            } catch (error) {
                console.log(error);
            }
        };

        getAPI();
    }, []);

    async function createAPIKey() {
        try {
            const { data } = await client.post("/auth/create-APIKey", {name:name});

            setAlert({
                msg: data.msg,
                error: false,
                success: true,
            });

            setTimeout(() => {
                setAlert({
                    msg: "",
                    error: false,
                    success: false,
                });
            }, 3000);
        } catch (error) {
            console.log(error);
            globalErr(error, setErrors, setAlert);
        }
    }

    const currentInfo = apiInfo?.apiInfo;

    return (
        <div className="api-integration-container">
            <header className="api-integration-header">
                <div>
                    <p className="api-integration-eyebrow">API integration</p>
                    <h3>Connect your app securely</h3>
                </div>
                <span className={`api-status-badge ${currentInfo?.status ?? "inactive"}`}>
                    {currentInfo?.status ?? "No key"}
                </span>
            </header>

            <div className="api-integration-grid">
                <section className="api-panel api-panel-create">
                    <div className="api-panel-header">
                        <div className="api-icon-badge">⧉</div>
                        <span>Create API key</span>
                    </div>

                    <h4>Generate a new credential</h4>
                    <p className="api-panel-description">
                        Add a unique name for your API key. The backend handles the security values such as the public key and secret key.
                    </p>

                    <div className="api-field-group">
                        <label htmlFor="api-key-name">API key name</label>
                        <input
                            id="api-key-name"
                            type="text"
                            value={name}
                            onChange={handleInput}
                            placeholder="e.g. payroll-sync"
                            className={errors.name ? "has-error" : ""}
                        />
                        {errors.name ? <small className="api-field-error">{String(errors.name)}</small> : null}
                    </div>

                    <button type="button" className="api-primary-button" onClick={createAPIKey}>
                        Create API key
                    </button>

                    {alert.msg ? (
                        <div className={`api-alert ${alert.success ? "success" : "error"}`}>
                            {alert.msg}
                        </div>
                    ) : null}
                </section>

                <section className="api-panel api-panel-show">
                    <div className="api-panel-header">
                        <div className="api-icon-badge alt">⌁</div>
                        <span>API details</span>
                    </div>

                    {currentInfo ? (
                        <>
                            <div className="api-summary-card">
                                <div className="api-summary-row">
                                    <span>Key name</span>
                                    <strong>{currentInfo.name}</strong>
                                </div>
                                <div className="api-summary-row">
                                    <span>Status</span>
                                    <strong>{currentInfo.status}</strong>
                                </div>
                                <div className="api-summary-row">
                                    <span>Account ID</span>
                                    <strong>{currentInfo.accountId}</strong>
                                </div>
                                <div className="api-summary-row">
                                    <span>Created</span>
                                    <strong>{new Date(currentInfo.createdAt).toLocaleString()}</strong>
                                </div>
                            </div>

                            <div className="api-secret-group">
                                <label>Public API key</label>
                                <div className="api-value-box">
                                    <span>{currentInfo.apiKey}</span>
                                </div>
                            </div>

                            <div className="api-secret-group">
                                <label>Secret API key</label>
                                <div className="api-value-box">
                                    <span>{currentInfo.apiSecret}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="api-empty-state">
                            <div className="api-empty-icon">🔐</div>
                            <h4>No API key generated yet</h4>
                            <p>Create a key to start using your developer credentials with third-party applications.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}