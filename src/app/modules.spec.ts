import { AppModule } from './app.module';
import { CoreModule } from './core/core.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { ItemDetailsModule } from './item-details/item-details.module';
import { UserModule } from './user/user.module';
import { routing } from './app.routes';

describe('Application modules', () => {
  it('should define AppModule', () => {
    expect(new AppModule()).toBeTruthy();
  });

  it('should define CoreModule', () => {
    expect(new CoreModule()).toBeTruthy();
  });

  it('should define SharedComponentsModule', () => {
    expect(new SharedComponentsModule()).toBeTruthy();
  });

  it('should define PipesModule', () => {
    expect(new PipesModule()).toBeTruthy();
  });

  it('should define ItemDetailsModule', () => {
    expect(new ItemDetailsModule()).toBeTruthy();
  });

  it('should define UserModule', () => {
    expect(new UserModule()).toBeTruthy();
  });

  it('should define the routing module', () => {
    expect(routing).toBeTruthy();
  });
});
