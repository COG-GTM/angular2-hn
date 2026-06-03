import { AppModule } from './app.module';
import { CoreModule } from './core/core.module';
import { ItemDetailsModule } from './item-details/item-details.module';
import { UserModule } from './user/user.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { routing } from './app.routes';

describe('Application NgModules', () => {
  it('instantiates every feature module', () => {
    expect(new AppModule()).toBeTruthy();
    expect(new CoreModule()).toBeTruthy();
    expect(new ItemDetailsModule()).toBeTruthy();
    expect(new UserModule()).toBeTruthy();
    expect(new SharedComponentsModule()).toBeTruthy();
    expect(new PipesModule()).toBeTruthy();
  });

  it('configures the root routing', () => {
    expect(routing).toBeTruthy();
  });
});
