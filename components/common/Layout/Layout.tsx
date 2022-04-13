import React, { FC, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import cn from 'classnames'

import s from './Layout.module.css'

import { useUI } from '@components/ui/context'
import { Navbar, Footer, TextSlider } from '@components/common'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import { Sidebar, Button, Modal, LoadingDots } from '@components/ui'
import CartSidebarView from '@components/cart/CartSidebarView'
import {
  LoginView,
  AuthOptionsView,
  CryptoOptionsView,
  CryptoSignUpView,
} from '@components/auth'
import { NFTClaimedView } from '@components/modals'
import CheckoutWarning from '@components/modals/CheckoutWarning'
import PurchaseSuccessView from '@components/modals/PurchaseSuccess'
import BespokeView from '@components/modals/Bespoke'

import { CommerceProvider } from '@framework'
import type { Page } from '@framework/common/get-all-pages'

import {
  setAccount,
  setChainId,
  setCrypto,
  setUser,
  setWallet,
  useMain,
  setMonaPrice,
  setDesigners,
} from 'context'
import { setWeb3Provider } from 'services/web3-provider.service'

import { getPayableTokenReport } from 'services/api.service'
import digitalaxApi from 'services/digitalaxApi.service'

import { tokens } from '../../../constants'

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
)

const dynamicProps = {
  loading: () => <Loading />,
}

const SignUpView = dynamic(
  () => import('@components/auth/SignUpView'),
  dynamicProps
)

const ForgotPassword = dynamic(
  () => import('@components/auth/ForgotPassword'),
  dynamicProps
)

const FeatureBar = dynamic(
  () => import('@components/common/FeatureBar'),
  dynamicProps
)

interface Props {
  pageProps: {
    pages?: Page[]
    commerceFeatures: Record<string, boolean>
  }
}

const Layout: FC<Props> = ({
  children,
  pageProps: { commerceFeatures, ...pageProps },
}) => {
  const {
    displaySidebar,
    displayModal,
    closeSidebar,
    closeModal,
    modalView,
  } = useUI()
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies()
  const { locale = 'en-US', pathname, asPath } = useRouter()
  const { dispatch, wallet, monaPrice, designers } = useMain()
  const [param, setParam] = useState('')

  useEffect(() => {
    if (window.localStorage.getItem('user')) {
      dispatch(setUser(JSON.parse(window.localStorage.getItem('user') || '')))
    }
    if (window.localStorage.getItem('ACCOUNT')) {
      dispatch(setAccount(window.localStorage.getItem('ACCOUNT') || ''))
    }
    if (window.localStorage.getItem('CHAIN_ID')) {
      dispatch(setChainId(window.localStorage.getItem('CHAIN_ID') || ''))
    }
    if (window.localStorage.getItem('CRYPTO_OPTION')) {
      dispatch(setCrypto(window.localStorage.getItem('CRYPTO_OPTION') || ''))
    }
    if (window.localStorage.getItem('WALLET')) {
      dispatch(
        setWallet(parseInt(window.localStorage.getItem('WALLET') || '0'))
      )
    }

    const fetchMonaPrice = async () => {
      const { payableTokenReport } = await getPayableTokenReport(
        tokens['mona'].address
      )

      console.log('mona: ', tokens['mona'].address)
      console.log('payableTokenReport: ', payableTokenReport)

      const updatedMonaPrice = payableTokenReport.payload / 1e18

      if (updatedMonaPrice !== monaPrice) {
        dispatch(setMonaPrice(updatedMonaPrice))
      }
    }

    fetchMonaPrice()

    const fetchDesigners = async () => {
      if (!designers || designers.length <= 0) {
        const allDesigners = (await digitalaxApi.getAllDesigners()) || []
        dispatch(setDesigners(allDesigners))
      }
    }

    fetchDesigners()
  }, [])

  useEffect(() => {
    if (wallet) {
      setWeb3Provider(wallet)
    }
  }, [wallet])

  useEffect(() => {
    if (asPath) {
      setParam(asPath)
    }
  }, [asPath])

  const getMainWrapperClassName = () => {
    if (param.includes('marketplace') || param.includes('web3-fashion-week')) {
      return s.marketplace
    }
    if (param.includes('minecraft')) {
      return s.collection2
    }
    if (param.includes('aave')) {
      return s.aave
    }
    if (param.includes('instadapp')) {
      return s.instadapp
    }
    if (param.includes('ruler')) {
      return s.ruler
    }
    if (param.includes('poap')) {
      return s.poap
    }
    if (param.includes('force')) {
      return s.force
    }
    if (param.includes('zerion')) {
      return s.zerion
    }
    if (param.includes('zapper')) {
      return s.zapper
    }
    if (param.includes('polygon')) {
      return s.polygon
    }
    if (param.includes('opyn')) {
      return s.opyn
    }
    if (param.includes('pickle')) {
      return s.pickle
    }
    if (param.includes('rari')) {
      return s.rari
    }
    if (param.includes('maker')) {
      return s.maker
    }
    if (param.includes('bancor')) {
      return s.bancor
    }
    if (param.includes('metameme')) {
      return s.collection1
    }
    if (param.includes('look')) {
      return s.look
    }
    if (param.includes('glitch')) {
      return s.glitch
    }
    return s.marketplace
  }
  return (
    <CommerceProvider locale={locale}>
      <div className={cn(s.root)}>
        <div
          id="mainWrapper"
          className={cn(s.mainWrapper, getMainWrapperClassName())}
        >
          {!pathname.includes('ambassadors') ? <Navbar /> : null}
          <main className="fit">{children}</main>
          {/* {!pathname.includes('shippingandreturns') &&
            !pathname.includes('product') && <TextSlider black />} */}
        </div>
        <Footer pages={pageProps.pages} />

        <Modal open={displayModal} onClose={closeModal}>
          {modalView === 'LOGIN_VIEW' && <LoginView />}
          {modalView === 'SIGNUP_VIEW' && <SignUpView />}
          {modalView === 'FORGOT_VIEW' && <ForgotPassword />}
          {modalView === 'AUTH_OPTIONS_VIEW' && <AuthOptionsView />}
          {modalView === 'CRYPTO_OPTIONS_VIEW' && <CryptoOptionsView />}
          {modalView === 'NFT_CLAIMED_VIEW' && <NFTClaimedView />}
          {modalView === 'CRYPTO_SIGNUP_VIEW' && <CryptoSignUpView />}
          {modalView === 'CHECKOUT_WARNING' && <CheckoutWarning />}
          {modalView === 'PURCHASE_SUCCESS_VIEW' && <PurchaseSuccessView />}
          {modalView === 'BESPOKE_VIEW' && <BespokeView />}
        </Modal>

        <Sidebar open={displaySidebar} onClose={closeSidebar}>
          <CartSidebarView />
        </Sidebar>

        {/* <FeatureBar
          title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
          hide={acceptedCookies}
          action={
            <Button className="mx-5" onClick={() => onAcceptCookies()}>
              Accept cookies
            </Button>
          }
        /> */}
      </div>
    </CommerceProvider>
  )
}

export default Layout
