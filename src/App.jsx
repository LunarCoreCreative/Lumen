import { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { TitleBar } from './components/TitleBar';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';
import { BannedScreen } from './components/BannedScreen';

// Lazy Loading dos componentes principais
const Login = lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const ResetPassword = lazy(() => import('./components/ResetPassword').then(module => ({ default: module.ResetPassword })));

import { usePresence } from './hooks/usePresence';
import { useNativeNotifications } from './hooks/useNativeNotifications';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetCode, setResetCode] = useState(null);
  const [bannedData, setBannedData] = useState(null);

  // Ativar rastreamento de presença
  usePresence(user?.uid);

  // Ativar notificações nativas
  useNativeNotifications(user?.uid);

  useEffect(() => {
    // Verificar se há código de redefinição de senha na URL
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode');
    if (oobCode) {
      setResetCode(oobCode);
    }

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Limpar listener anterior se existir
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        try {
          const { doc, onSnapshot, updateDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          const { checkIpBan } = await import('./utils/ownerUtils');

          // 1. Verificar IP Ban
          try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const { ip } = await ipResponse.json();

            const isIpBanned = await checkIpBan(ip);

            if (isIpBanned) {
              await auth.signOut();
              setBannedData({ type: 'ip', reason: 'Endereço IP banido permanentemente.' });
              setUser(null);
              setLoading(false);
              return;
            }

            // 2. Atualizar IP do usuário
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              lastIp: ip,
              lastLogin: serverTimestamp()
            });

          } catch (ipError) {
            console.error('Erro ao verificar IP:', ipError);
            // Continua mesmo se falhar a verificação de IP
          }

          // 3. Buscar dados do usuário
          const userRef = doc(db, 'users', currentUser.uid);

          // Listener para mudanças no documento do usuário
          unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();

              // Verificar se foi banido enquanto estava logado
              if (userData.isBanned) {
                auth.signOut();
                setBannedData({ type: 'account', reason: userData.bannedReason });
                setUser(null);
                setLoading(false);
                return;
              }

              // Combinar Auth User + Firestore Data
              setUser({ ...currentUser, ...userData });
            } else {
              setUser(currentUser);
            }
            setLoading(false);
          });

        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUser(currentUser);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const handleBackToLogin = () => {
    setResetCode(null);
    // Limpar URL sem recarregar
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* <TitleBar /> - Usando barra nativa do Windows por enquanto */}
      <UpdateNotification />
      {bannedData && (
        <BannedScreen
          type={bannedData.type}
          reason={bannedData.reason}
          onDismiss={() => {
            setBannedData(null);
            window.location.reload();
          }}
        />
      )}
      <div className="appContainer">
        <Suspense fallback={<LoadingScreen />}>
          {resetCode ? (
            <ResetPassword oobCode={resetCode} onBackToLogin={handleBackToLogin} />
          ) : user ? (
            <Dashboard user={user} />
          ) : (
            <Login />
          )}
        </Suspense>
      </div>
    </>
  );
}

export default App;
